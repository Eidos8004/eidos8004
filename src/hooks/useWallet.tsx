'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { connectWallet, getProvider, formatAddress } from '@/lib/contracts';
import type { WalletState } from '@/types';
import { BASE_SEPOLIA } from '@/lib/contracts/config';

interface WalletContextType {
  wallet: WalletState;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isCorrectChain: boolean;
  formattedAddress: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    chainId: null,
    balance: null,
    ensName: null,
  });
  const [loading, setLoading] = useState(true); // Start loading to prevent flash of connect button
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const address = await connectWallet();
      const provider = getProvider();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      const { ethers } = await import('ethers');

      setWallet({
        connected: true,
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        ensName: null,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      connected: false,
      address: null,
      chainId: null,
      balance: null,
      ensName: null,
    });
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setLoading(false);
      return;
    }

    const ethereum = (window as any).ethereum;

    const checkConnection = async () => {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          await connect();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to check wallet connection:", err);
        setLoading(false);
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [connect, disconnect]);

  return (
    <WalletContext.Provider value={{
      wallet,
      loading,
      error,
      connect,
      disconnect,
      isCorrectChain: wallet.chainId === BASE_SEPOLIA.chainId,
      formattedAddress: wallet.address ? formatAddress(wallet.address) : null,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
