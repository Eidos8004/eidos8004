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
4. Construct a 3-round chat transcript where DesignSeeker requests the design, Aurora.AI proposes the artifacts, and DesignSeeker accepts them.
5. Return the exact JSON structure below with NO markdown formatting:

{
  "selectedDesigns": [
    {
      "designId": <number>,
      "title": "<string>",
      "artist": "<string>",
      "selectedArtifacts": [
        { "id": <number>, "name": "<string>", "price": "<string>" }
      ]
    }
  ],
  "totalCost": "<string>",
  "transcript": [
    { "agent": "DesignSeeker", "type": "client", "message": "<string>" },
    { "agent": "Aurora.AI", "type": "artist", "message": "<string>" },
    { "agent": "DesignSeeker", "type": "client", "message": "<string>" }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast, cost-effective model suitable for dynamic agent conversations
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from HeyElsa AI orchestrator");
    
    return JSON.parse(content);
  } catch (err) {
    console.error("Agent negotiation logic error:", err);
    throw new Error("HeyElsa SDK error during negotiation");
  }
}
