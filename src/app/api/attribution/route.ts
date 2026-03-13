import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/attribution
 * Records an attribution event and triggers payment.
 * In production, interacts with the AttributionPayment contract.
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

    // Simulate attribution recording
    const attribution = {
      id: Math.floor(Math.random() * 10000),
      designId,
      artifactIds,
      clientAgent: clientAddress,
      artist: '0x742d35Cc6634C0532925a3b844Bc9e7595f1a3e', // Demo
      totalPaid: (artifactIds.length * 0.03).toFixed(4),
      x402ProofHash: x402ProofHash || `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      timestamp: Math.floor(Date.now() / 1000),
      txHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockExplorerUrl: 'https://sepolia.basescan.org/tx/0x...',
    };

    return NextResponse.json({
      success: true,
      data: {
        attribution,
        message: `Attribution recorded. ${artifactIds.length} artifact(s) paid for.`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Attribution recording failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/attribution?artist=...&client=...
 * Retrieves attribution history.
 */
export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get('artist');

  const demoAttributions = [
    { id: 1, designId: 1, artifacts: ['Color Palette', 'Typography'], totalPaid: '0.06', client: '0xAgent1...', timestamp: Date.now() / 1000 - 120 },
    { id: 2, designId: 2, artifacts: ['Chart Styles'], totalPaid: '0.04', client: '0xAgent2...', timestamp: Date.now() / 1000 - 3600 },
    { id: 3, designId: 1, artifacts: ['Button Components'], totalPaid: '0.03', client: '0xAgent3...', timestamp: Date.now() / 1000 - 7200 },
  ];

  return NextResponse.json({
    success: true,
    data: {
      attributions: demoAttributions,
      total: demoAttributions.length,
      totalVolume: '0.13',
    },
  });
}
