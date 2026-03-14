/**
 * Fileverse Integration Wrapper
 * Uses the HTTP REST API to handle JSON log storage for Attribution events.
 */

// Define the shape of an attribution event log
export interface AttributionLog {
  designId: string | number;
  artifactIds: number[];
  clientAgent: string;
  artist: string;
  totalPaid: string;
  x402ProofHash: string;
  timestamp: number;
}

/**
 * Uploads an attribution log to Fileverse as a decentralized DDoc.
 */
export async function uploadAttributionLog(logData: AttributionLog): Promise<string> {
  const apiKey = process.env.FILEVERSE_API_KEY;
  if (!apiKey) {
    console.warn("FILEVERSE_API_KEY not found in environment, returning mock document ID");
    return `fv_mock_${Date.now()}`;
  }

  try {
    // Note: This URL structure targets standard generalized Fileverse API endpoints.
    // In a real hackathon submission, you may use their specific Portal API structure.
    const res = await fetch("https://api.fileverse.io/v1/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        title: `Attribution_${logData.x402ProofHash.substring(0, 10)}`,
        content: JSON.stringify(logData, null, 2),
        type: "json", // Instructs Fileverse to handle this as a raw data doc
        isPublic: true, // Decentralized logs should be verifiable by the public
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Fileverse API Error:", res.status, errText);
      throw new Error("Failed to upload attribution log to Fileverse.");
    }

    const data = await res.json();
    return data.documentId || data.id || `fv_${Date.now()}`;
  } catch (error) {
    console.error("Error in uploadAttributionLog:", error);
    // Graceful fallback for demo
    return `fv_fallback_${Date.now()}`;
  }
}

/**
 * Simulates fetching recent attribution logs (typically one would index the blockchain or store a mapping)
 */
export async function fetchRecentLogs(): Promise<AttributionLog[]> {
  // In a full production implementation, we would query the Fileverse portal for all documents
  // created by this API key, or index our Smart Contract events and fetch the specific Fileverse CIDs.
  // For the sake of the decentralized hackathon presentation, we simulate the retrieval formatting:
  return [
    {
      designId: 1,
      artifactIds: [0, 1],
      clientAgent: "0xClientAgentAlpha",
      artist: "0x742d35Cc6634C0532925a3b844Bc9e7595f1a3e",
      totalPaid: "0.06",
      x402ProofHash: "0x9d4a...b321",
      timestamp: Date.now() / 1000 - 3600, // 1 hour ago
    }
  ];
}
