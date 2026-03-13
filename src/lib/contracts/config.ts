// Contract ABIs and addresses for Eidos8004
// Update these addresses after deploying via Remix on Base Sepolia

export const CONTRACTS = {
  DESIGN_REGISTRY: {
    address: process.env.NEXT_PUBLIC_DESIGN_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: [
      'function mintDesign(string,string,string,string,string[],string) external returns (uint256)',
      'function addArtifact(uint256,string,string,uint256) external',
      'function updateArtifactPrice(uint256,uint256,uint256) external',
      'function toggleArtifact(uint256,uint256) external',
      'function getDesign(uint256) external view returns (tuple(address artist, string title, string description, string category, string ipfsCid, string[] tags, uint256 thresholdPrice, uint256 createdAt, bool isPublic))',
      'function getDesignArtifacts(uint256) external view returns (tuple(string name, string description, uint256 priceInWei, bool active)[])',
      'function getArtistDesigns(address) external view returns (uint256[])',
      'function calculateArtifactsCost(uint256,uint256[]) external view returns (uint256)',
      'function totalDesigns() external view returns (uint256)',
      'function ownerOf(uint256) external view returns (address)',
      'event DesignMinted(uint256 indexed tokenId, address indexed artist, string title, string ipfsCid, uint256 timestamp)',
      'event ArtifactAdded(uint256 indexed designId, uint256 artifactIndex, string name, uint256 priceInWei)',
      'event ThresholdPriceUpdated(uint256 indexed designId, uint256 newThreshold)',
    ],
  },
  AGENT_REGISTRY: {
    address: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: [
      'function registerAgent(uint8,string,string,string,string) external returns (uint256)',
      'function deactivateAgent(uint256) external',
      'function submitFeedback(uint256,uint8,string,string) external',
      'function requestValidation(uint256,string) external returns (uint256)',
      'function fulfillValidation(uint256,uint256,string,uint8) external',
      'function getAgent(uint256) external view returns (tuple(address wallet, uint8 agentType, string name, string description, string capabilitiesURI, uint256 registeredAt, bool active))',
      'function getAgentByWallet(address) external view returns (tuple(address wallet, uint8 agentType, string name, string description, string capabilitiesURI, uint256 registeredAt, bool active))',
      'function isRegisteredAgent(address) external view returns (bool)',
      'function getReputationScore(uint256) external view returns (uint256)',
      'function walletToAgentId(address) external view returns (uint256)',
      'function totalAgents() external view returns (uint256)',
      'event AgentRegistered(uint256 indexed agentId, address indexed wallet, uint8 agentType, string name, uint256 timestamp)',
      'event FeedbackSubmitted(uint256 indexed agentId, address indexed submitter, uint8 score, string tag, uint256 timestamp)',
    ],
  },
  ATTRIBUTION_PAYMENT: {
    address: process.env.NEXT_PUBLIC_ATTRIBUTION_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: [
      'function payForArtifacts(uint256,uint256[],bytes32) external payable returns (uint256)',
      'function getAttribution(uint256) external view returns (tuple(uint256 designId, address clientAgent, address artistAgent, address artist, uint256[] artifactIds, uint256 totalPaid, bytes32 x402ProofHash, uint256 timestamp))',
      'function getArtistAttributions(address) external view returns (uint256[])',
      'function getClientAttributions(address) external view returns (uint256[])',
      'function getDesignAttributionHistory(uint256) external view returns (uint256[])',
      'function getStats() external view returns (uint256, uint256, uint256)',
      'function totalPayments() external view returns (uint256)',
      'function totalVolume() external view returns (uint256)',
      'event AttributionPaid(uint256 indexed attributionId, uint256 indexed designId, address indexed artist, address clientAgent, uint256[] artifactIds, uint256 totalPaid, bytes32 x402ProofHash, uint256 timestamp)',
    ],
  },
  REPUTATION_FORUM: {
    address: process.env.NEXT_PUBLIC_REPUTATION_FORUM_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: [
      'function createPost(string,string[]) external returns (uint256)',
      'function reply(uint256,string) external returns (uint256)',
      'function vote(uint256,bool) external',
      'function removePost(uint256) external',
      'function emitPlatformEvent(string,string) external',
      'function getPost(uint256) external view returns (tuple(uint256 id, address author, string content, string[] tags, uint256 parentId, uint256 createdAt, uint256 upvotes, uint256 downvotes, bool isActive))',
      'function getPostReplies(uint256) external view returns (uint256[])',
      'function getRecentPosts(uint256) external view returns (tuple(uint256 id, address author, string content, string[] tags, uint256 parentId, uint256 createdAt, uint256 upvotes, uint256 downvotes, bool isActive)[])',
      'function getRecentEvents(uint256) external view returns (tuple(uint256 id, string eventType, address actor, string data, uint256 timestamp)[])',
      'function totalPosts() external view returns (uint256)',
      'function totalEvents() external view returns (uint256)',
      'event PostCreated(uint256 indexed postId, address indexed author, string content, string[] tags, uint256 parentId, uint256 timestamp)',
      'event LiveEventEmitted(uint256 indexed eventId, string eventType, address indexed actor, string data, uint256 timestamp)',
    ],
  },
};

// Base Sepolia network configuration
export const BASE_SEPOLIA = {
  chainId: 84532,
  chainIdHex: '0x14a34',
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  currency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};
