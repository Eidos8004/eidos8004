// Eidos8004 TypeScript Type Definitions

// --- Contract Types ---

export interface Artifact {
  name: string;
  description: string;
  priceInWei: string; // BigNumber as string
  active: boolean;
}

export interface Design {
  tokenId: number;
  artist: string;
  title: string;
  description: string;
  category: string;
  ipfsCid: string;
  tags: string[];
  thresholdPrice: string;
  createdAt: number;
  isPublic: boolean;
  artifacts: Artifact[];
  imageUrl?: string;
}

export interface Agent {
  agentId: number;
  wallet: string;
  agentType: AgentType;
  name: string;
  description: string;
  capabilitiesURI: string;
  registeredAt: number;
  active: boolean;
  reputationScore?: number;
}

export enum AgentType {
  CLIENT = 0,
  ARTIST = 1,
}

export interface Attribution {
  id: number;
  designId: number;
  clientAgent: string;
  artistAgent: string;
  artist: string;
  artifactIds: number[];
  totalPaid: string;
  x402ProofHash: string;
  timestamp: number;
}

export interface ForumPost {
  id: number;
  author: string;
  content: string;
  tags: string[];
  parentId: number;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  isActive: boolean;
  replies?: ForumPost[];
}

export interface LiveEvent {
  id: number;
  eventType: string;
  actor: string;
  data: string;
  timestamp: number;
}

export interface Feedback {
  submitter: string;
  agentId: number;
  score: number;
  tag: string;
  uri: string;
  timestamp: number;
}

// --- UI Types ---

export interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  ensName: string | null;
}

export interface NegotiationMessage {
  id: string;
  sender: 'client' | 'artist';
  agentName: string;
  ensName?: string;
  content: string;
  timestamp: number;
  artifactIds?: number[];
  priceOffer?: string;
}

export interface NegotiationSession {
  id: string;
  clientAgent: Agent;
  artistAgents: Agent[];
  designId: number;
  messages: NegotiationMessage[];
  status: 'pending' | 'negotiating' | 'agreed' | 'failed';
  selectedArtifacts: number[];
  agreedPrice?: string;
}

export interface PlatformStats {
  totalDesigns: number;
  totalAgents: number;
  totalPayments: number;
  totalVolume: string;
  totalPosts: number;
}

export interface CaseStudyData {
  title: string;
  description: string;
  year: number;
  impactAmount: string;
  source: string;
  category: 'lawsuit' | 'settlement' | 'complaint' | 'regulation';
}

// --- API Types ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DesignSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  minPrice?: string;
  maxPrice?: string;
  artist?: string;
}

export interface NegotiateRequest {
  prompt: string;
  budget: string;
  designIds: number[];
}

export interface NegotiateResponse {
  session: NegotiationSession;
  transcript: NegotiationMessage[];
  selectedDesignId: number;
  selectedArtifacts: number[];
  totalCost: string;
}
