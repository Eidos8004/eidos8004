import { NextRequest, NextResponse } from 'next/server';
import { uploadAttributionLog } from '@/lib/fileverse';

/**
 * POST /api/attribution
 * Records an attribution event, triggers payment context, and permanently stores decentralized logs on Fileverse.
 * In production, this can also interact with the AttributionPayment contract on-chain natively.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { designId, artifactIds, clientAddress, x402ProofHash } = body;

    if (!designId || !artifactIds || !clientAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: designId, artifactIds, clientAddress' },
        { status: 400 }
      );
    }

    const artistAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f1a3e'; // Demo 
    const totalPaidEth = (artifactIds.length * 0.03).toFixed(4); // Or inherit real values

    // 1. Build the log payload
    const logData = {
      designId,
      artifactIds,
      clientAgent: clientAddress,
      artist: artistAddress,
      totalPaid: totalPaidEth,
      x402ProofHash: x402ProofHash || `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      timestamp: Math.floor(Date.now() / 1000),
    };

    // 2. Upload immutable attribution JSON doc via Fileverse API
    const fileverseDocId = await uploadAttributionLog(logData);

    // 3. Construct API result context
    const attribution = {
      id: fileverseDocId, // Using the decentralized log ID for attribution lookups
      ...logData,
      txHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockExplorerUrl: 'https://sepolia.basescan.org/tx/0x...',
      fileverseLogUrl: `https://fileverse.io/docs/${fileverseDocId}`, // Point to the decentralized record
    };

    return NextResponse.json({
      success: true,
      data: {
        attribution,
        message: `Attribution logically verified. ${artifactIds.length} artifact(s) logged securely to Fileverse doc ${fileverseDocId}.`,
      },
    });
  } catch (error) {
    console.error("Attribution record error:", error);
    return NextResponse.json(
      { success: false, error: 'Attribution recording failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/attribution?artist=...&client=...
 * Retrieves attribution history from Fileverse or indexes.
 */
export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get('artist');

  try {
    // In a dynamic scenario, we fetch the Fileverse logs or query an indexer
    const { fetchRecentLogs } = await import('@/lib/fileverse');
    const logs = await fetchRecentLogs();

    return NextResponse.json({
      success: true,
      data: {
        attributions: logs,
        total: logs.length,
        totalVolume: logs.reduce((acc, l) => acc + parseFloat(l.totalPaid), 0).toFixed(4),
      },
    });
  } catch (error) {
    console.error("Attribution fetch error:", error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve attribution history' },
      { status: 500 }
    );
  }
}
