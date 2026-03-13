// Contract interaction helpers using ethers v6
import { ethers } from 'ethers';
import { CONTRACTS, BASE_SEPOLIA } from './config';
import type { Design, Artifact, Agent, Attribution, ForumPost, LiveEvent } from '@/types';

// --- Provider & Signer --- 

export function getProvider() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return new ethers.JsonRpcProvider(BASE_SEPOLIA.rpcUrl);
}

export async function getSigner() {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    return provider.getSigner();
  }
  throw new Error('No wallet connected');
}

export async function connectWallet(): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  
  // Request account access
  const accounts = await provider.send('eth_requestAccounts', []);
  
  // Switch to Base Sepolia if not already
  try {
    await provider.send('wallet_switchEthereumChain', [
      { chainId: BASE_SEPOLIA.chainIdHex },
    ]);
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await provider.send('wallet_addEthereumChain', [{
        chainId: BASE_SEPOLIA.chainIdHex,
        chainName: BASE_SEPOLIA.name,
        nativeCurrency: BASE_SEPOLIA.currency,
        rpcUrls: [BASE_SEPOLIA.rpcUrl],
        blockExplorerUrls: [BASE_SEPOLIA.blockExplorer],
      }]);
    }
  }

  return accounts[0];
}

// --- Contract Instances ---

function getDesignRegistryContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACTS.DESIGN_REGISTRY.address, CONTRACTS.DESIGN_REGISTRY.abi, provider);
}

function getAgentRegistryContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACTS.AGENT_REGISTRY.address, CONTRACTS.AGENT_REGISTRY.abi, provider);
}

function getAttributionPaymentContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACTS.ATTRIBUTION_PAYMENT.address, CONTRACTS.ATTRIBUTION_PAYMENT.abi, provider);
}

function getReputationForumContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACTS.REPUTATION_FORUM.address, CONTRACTS.REPUTATION_FORUM.abi, provider);
}

// --- Design Registry Functions ---

export async function mintDesign(
  title: string,
  description: string,
  category: string,
  ipfsCid: string,
  tags: string[],
  tokenURI: string
): Promise<number> {
  const signer = await getSigner();
  const contract = getDesignRegistryContract(signer);
  const tx = await contract.mintDesign(title, description, category, ipfsCid, tags, tokenURI);
  const receipt = await tx.wait();
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'DesignMinted';
    } catch { return false; }
  });
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return Number(parsed?.args[0]);
  }
  return 0;
}

export async function addArtifact(
  designId: number,
  name: string,
  description: string,
  priceInWei: string
): Promise<void> {
  const signer = await getSigner();
  const contract = getDesignRegistryContract(signer);
  const tx = await contract.addArtifact(designId, name, description, priceInWei);
  await tx.wait();
}

export async function getDesign(designId: number): Promise<Design | null> {
  try {
    const contract = getDesignRegistryContract();
    const data = await contract.getDesign(designId);
    const artifacts = await contract.getDesignArtifacts(designId);
    
    return {
      tokenId: designId,
      artist: data.artist,
      title: data.title,
      description: data.description,
      category: data.category,
      ipfsCid: data.ipfsCid,
      tags: [...data.tags],
      thresholdPrice: data.thresholdPrice.toString(),
      createdAt: Number(data.createdAt),
      isPublic: data.isPublic,
      artifacts: artifacts.map((a: any) => ({
        name: a.name,
        description: a.description,
        priceInWei: a.priceInWei.toString(),
        active: a.active,
      })),
    };
  } catch {
    return null;
  }
}

export async function getArtistDesigns(artist: string): Promise<number[]> {
  const contract = getDesignRegistryContract();
  const ids = await contract.getArtistDesigns(artist);
  return ids.map((id: any) => Number(id));
}

export async function getTotalDesigns(): Promise<number> {
  const contract = getDesignRegistryContract();
  return Number(await contract.totalDesigns());
}

// --- Agent Registry Functions ---

export async function registerAgent(
  agentType: number,
  name: string,
  description: string,
  capabilitiesURI: string,
  tokenURI: string
): Promise<number> {
  const signer = await getSigner();
  const contract = getAgentRegistryContract(signer);
  const tx = await contract.registerAgent(agentType, name, description, capabilitiesURI, tokenURI);
  const receipt = await tx.wait();
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'AgentRegistered';
    } catch { return false; }
  });
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return Number(parsed?.args[0]);
  }
  return 0;
}

export async function getAgent(agentId: number): Promise<Agent | null> {
  try {
    const contract = getAgentRegistryContract();
    const data = await contract.getAgent(agentId);
    const score = await contract.getReputationScore(agentId);
    return {
      agentId,
      wallet: data.wallet,
      agentType: Number(data.agentType),
      name: data.name,
      description: data.description,
      capabilitiesURI: data.capabilitiesURI,
      registeredAt: Number(data.registeredAt),
      active: data.active,
      reputationScore: Number(score),
    };
  } catch {
    return null;
  }
}

export async function submitFeedback(
  agentId: number,
  score: number,
  tag: string,
  uri: string
): Promise<void> {
  const signer = await getSigner();
  const contract = getAgentRegistryContract(signer);
  const tx = await contract.submitFeedback(agentId, score, tag, uri);
  await tx.wait();
}

// --- Attribution Payment Functions ---

export async function payForArtifacts(
  designId: number,
  artifactIds: number[],
  x402ProofHash: string,
  valueInWei: string
): Promise<number> {
  const signer = await getSigner();
  const contract = getAttributionPaymentContract(signer);
  const tx = await contract.payForArtifacts(designId, artifactIds, x402ProofHash, {
    value: valueInWei,
  });
  const receipt = await tx.wait();
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'AttributionPaid';
    } catch { return false; }
  });
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return Number(parsed?.args[0]);
  }
  return 0;
}

export async function getAttribution(id: number): Promise<Attribution | null> {
  try {
    const contract = getAttributionPaymentContract();
    const data = await contract.getAttribution(id);
    return {
      id,
      designId: Number(data.designId),
      clientAgent: data.clientAgent,
      artistAgent: data.artistAgent,
      artist: data.artist,
      artifactIds: data.artifactIds.map((id: any) => Number(id)),
      totalPaid: data.totalPaid.toString(),
      x402ProofHash: data.x402ProofHash,
      timestamp: Number(data.timestamp),
    };
  } catch {
    return null;
  }
}

export async function getPlatformStats() {
  const contract = getAttributionPaymentContract();
  const [totalPayments, totalVolume, totalAttributions] = await contract.getStats();
  return {
    totalPayments: Number(totalPayments),
    totalVolume: totalVolume.toString(),
    totalAttributions: Number(totalAttributions),
  };
}

// --- Forum Functions ---

export async function createForumPost(content: string, tags: string[]): Promise<number> {
  const signer = await getSigner();
  const contract = getReputationForumContract(signer);
  const tx = await contract.createPost(content, tags);
  const receipt = await tx.wait();
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'PostCreated';
    } catch { return false; }
  });
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return Number(parsed?.args[0]);
  }
  return 0;
}

export async function getRecentPosts(count: number): Promise<ForumPost[]> {
  const contract = getReputationForumContract();
  const posts = await contract.getRecentPosts(count);
  return posts.map((p: any) => ({
    id: Number(p.id),
    author: p.author,
    content: p.content,
    tags: [...p.tags],
    parentId: Number(p.parentId),
    createdAt: Number(p.createdAt),
    upvotes: Number(p.upvotes),
    downvotes: Number(p.downvotes),
    isActive: p.isActive,
  }));
}

export async function getRecentEvents(count: number): Promise<LiveEvent[]> {
  const contract = getReputationForumContract();
  const events = await contract.getRecentEvents(count);
  return events.map((e: any) => ({
    id: Number(e.id),
    eventType: e.eventType,
    actor: e.actor,
    data: e.data,
    timestamp: Number(e.timestamp),
  }));
}

// --- Utility ---

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(wei: string): string {
  return ethers.formatEther(wei);
}

export function parseEth(eth: string): string {
  return ethers.parseEther(eth).toString();
}
