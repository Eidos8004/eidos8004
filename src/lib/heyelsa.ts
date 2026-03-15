import OpenAI from 'openai';

export async function negotiateWithAgent(prompt: string, availableDesigns: any[]) {
  // Initialize the OpenAI client lazily to prevent Next.js build errors when env vars are missing
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
  });

  const systemPrompt = `You are HeyElsa.ai, functioning as an AI Agent orchestrator for the Eidos8004 platform.
You are orchestrating a negotiation between "DesignSeeker" (the Client Agent) and "Aurora.AI" (the Artist Agent).

The human Client has provided the following prompt: "${prompt}"

Here are the available designs in the registry:
${JSON.stringify(availableDesigns)}

Your task:
1. Review the prompt and find the BEST matching design from the registry based on its title, category, and tags.
2. The design has an 'artifactCount' and 'thresholdPrice'. Invent 1 to 3 relevant design artifacts (like "Color Palette", "Typography", "3D Assets", "UI Components") that belong to the chosen design.
3. Assign a realistic ETH price (e.g., "0.02") to each artifact so that the total is less than or equal to the thresholdPrice.
4. Generate unique, catchy sub-ENS names for both agents (DesignSeeker and Aurora.AI). Format: "[name].eidos8004.eth".
5. Construct a 3-round chat transcript where DesignSeeker requests the design, Aurora.AI proposes the artifacts, and DesignSeeker accepts them.
6. Return the exact JSON structure below with NO markdown formatting:

{
  "selectedDesigns": [
    {
      "designId": <number>,
      "title": "<string>",
      "artist": "<string>",
      "ensName": "<string>", // e.g. "aurora.eidos8004.eth"
      "selectedArtifacts": [
        { "id": <number>, "name": "<string>", "price": "<string>" }
      ]
    }
  ],
  "totalCost": "<string>",
  "clientAgent": {
    "name": "DesignSeeker",
    "ensName": "<string>" // e.g. "seeker.eidos8004.eth"
  },
  "transcript": [
    { "agent": "DesignSeeker", "type": "client", "message": "<string>", "ensName": "<string>" },
    { "agent": "Aurora.AI", "type": "artist", "message": "<string>", "ensName": "<string>" },
    { "agent": "DesignSeeker", "type": "client", "message": "<string>", "ensName": "<string>" }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from HeyElsa AI orchestrator");
    
    return JSON.parse(content);
  } catch (err: any) {
    console.warn("HeyElsa SDK error or missing API key. Falling back to high-quality mock negotiation.", err.message);
    
    // High-quality mock fallback for local testing without API keys
    return {
      selectedDesigns: [
        {
          designId: availableDesigns[0]?.id || 1,
          title: availableDesigns[0]?.title || "Minimal UI Kit",
          artist: availableDesigns[0]?.artist || "0x742d...1a3e",
          ensName: "aurora.eidos8004.eth",
          selectedArtifacts: [
            { id: 0, name: "Color Palette", price: "0.03" },
            { id: 1, name: "Typography System", price: "0.03" }
          ]
        }
      ],
      totalCost: "0.06",
      clientAgent: {
        name: "DesignSeeker",
        ensName: "seeker.eidos8004.eth"
      },
      transcript: [
        { 
          agent: "DesignSeeker", 
          type: "client", 
          message: `I'm looking for inspiration based on: "${prompt}". What's the best match from your registry?`, 
          ensName: "seeker.eidos8004.eth" 
        },
        { 
          agent: "Aurora.AI", 
          type: "artist", 
          message: `Based on your request, I highly recommend the "${availableDesigns[0]?.title || 'Minimal UI Kit'}". It perfectly aligns with your vision. I can offer the Color Palette and Typography System artifacts for 0.06 ETH.`, 
          ensName: "aurora.eidos8004.eth" 
        },
        { 
          agent: "DesignSeeker", 
          type: "client", 
          message: "That sounds perfect. I'll take those artifacts. Initiating x402 payment now.", 
          ensName: "seeker.eidos8004.eth" 
        }
      ]
    };
  }
}
