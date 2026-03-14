import { NextRequest, NextResponse } from 'next/server';
import { createAgentWallet, transferToArtist } from '@/lib/bitgo';

/**
 * POST /api/agents/negotiate
 * Handles agent-to-agent negotiation for design inspiration.
 * In production, this would orchestrate OpenClaw/HeyElsa agents.
 * For the hackathon demo, returns simulated negotiation results and real BitGo transaction states (if credentials allow).
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

    // Simulate agent negotiation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // We will generate a mock BitGo agent wallet to simulate the client side.
    const agentWallet = await createAgentWallet("ClientAgentWallet-Demo", "EidosTestnetPassphrase8004!");
    const totalAmount = '0.06'; // Example amount from the demo
    const artistAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f1a3e';
    
    // Execute a simulated transfer to the Artist
    // Note: bitgo API actually deals in base satoshis or wei, so this amount logic
    // might need to be parsed in a real scenario, but we stick to eth values for mock demo representation.
    const bitgoTx = await transferToArtist(
      agentWallet.id,
      artistAddress,
      totalAmount,
      "EidosTestnetPassphrase8004!"
    );

    // Demo negotiation result
    const result = {
      success: true,
      data: {
        session: {
          id: `session_${Date.now()}`,
          status: 'agreed',
          rounds: 3,
        },
        selectedDesigns: [
          {
            designId: 1,
            title: 'Minimal UI Kit',
            artist: artistAddress,
            selectedArtifacts: [
              { id: 0, name: 'Color Palette', price: '0.03' },
              { id: 1, name: 'Typography System', price: '0.03' },
            ],
          },
        ],
        totalCost: totalAmount,
        transcript: [
          {
            agent: 'DesignSeeker',
            type: 'client',
            message: `Searching for designs matching: "${prompt}"`,
          },
          {
            agent: 'Aurora.AI',
            type: 'artist',
            message: 'Proposing "Minimal UI Kit" - Color Palette and Typography System match the brief perfectly.',
          },
          {
            agent: 'DesignSeeker',
            type: 'client',
            message: `Accepted. Initiating x402 payment from Agent Wallet ${agentWallet.id} for 2 artifacts at ${totalAmount} ETH total.`,
          },
        ],
        x402Payment: {
          status: bitgoTx.status || 'ready',
          amount: bitgoTx.amountInWei,
          currency: 'tETH',
          recipient: bitgoTx.toAddress,
          proofHash: bitgoTx.txid, // We use the bitgo transaction ID as the proof hash for simplicity
          sourceWallet: agentWallet.id
        },
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Negotiation API error:", error);
    return NextResponse.json(
      { success: false, error: 'Negotiation failed' },
      { status: 500 }
    );
  }
}
