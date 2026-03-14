import { NextRequest, NextResponse } from 'next/server';
import { createAgentWallet, transferToArtist } from '@/lib/bitgo';
import { negotiateWithAgent } from '@/lib/heyelsa';

// Demo design catalog shared with discover route
const availableDesigns = [
  { id: 1, title: 'Minimal UI Kit', artist: '0x742d...1a3e', category: 'UI Design', tags: ['minimal', 'fintech', 'clean'], thresholdPrice: '0.15', artifactCount: 5 },
  { id: 2, title: 'Cyberpunk Dashboard', artist: '0xab12...ff91', category: 'Dashboard', tags: ['cyberpunk', 'data-viz', 'neon'], thresholdPrice: '0.24', artifactCount: 6 },
  { id: 3, title: 'Japanese Garden UI', artist: '0x5f67...c4d2', category: 'Mobile', tags: ['japanese', 'nature', 'zen'], thresholdPrice: '0.16', artifactCount: 4 },
  { id: 4, title: 'Brutalist Portfolio', artist: '0x891f...b2c7', category: 'Portfolio', tags: ['brutalist', 'bold', 'typography'], thresholdPrice: '0.12', artifactCount: 3 },
];

/**
 * POST /api/agents/negotiate
 * Handles agent-to-agent negotiation for design inspiration using HeyElsa.ai / OpenClaw logic.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, budget, designIds } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Design prompt is required' },
        { status: 400 }
      );
    }

    // Call the AI Agent Orchestrator to dynamically negotiate using the prompt
    console.log("Initiating HeyElsa AI Agent Negotiation...");
    const aiResponse = await negotiateWithAgent(prompt, availableDesigns);
    const totalAmount = aiResponse.totalCost || '0.05'; 
    const artistAddress = aiResponse.selectedDesigns?.[0]?.artist?.startsWith('0x') 
        ? aiResponse.selectedDesigns[0].artist 
        : '0x742d35Cc6634C0532925a3b844Bc9e7595f1a3e';

    // We generate a mock BitGo agent wallet to simulate the client side paying for the determined artifacts.
    const agentWallet = await createAgentWallet("ClientAgentWallet-Demo", "EidosTestnetPassphrase8004!");
    
    // Execute a simulated transfer to the Artist
    const bitgoTx = await transferToArtist(
      agentWallet.id,
      artistAddress,
      totalAmount,
      "EidosTestnetPassphrase8004!"
    );

    // Build the dynamic negotiation result
    const result = {
      success: true,
      data: {
        session: {
          id: `session_${Date.now()}`,
          status: 'agreed',
          rounds: Math.max(3, aiResponse.transcript?.length || 3),
        },
        selectedDesigns: aiResponse.selectedDesigns,
        totalCost: totalAmount,
        transcript: aiResponse.transcript,
        x402Payment: {
          status: bitgoTx.status || 'ready',
          amount: bitgoTx.amountInWei,
          currency: 'tETH',
          recipient: bitgoTx.toAddress,
          proofHash: bitgoTx.txid, // BitGo transaction ID
          sourceWallet: agentWallet.id
        },
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Negotiation API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Negotiation failed' },
      { status: 500 }
    );
  }
}
