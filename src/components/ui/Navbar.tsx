'use client';

import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { Palette, Bot, BarChart3, MessageSquare, FileText, Wallet } from 'lucide-react';

export default function Navbar() {
  const { wallet, connect, disconnect, loading, formattedAddress, isCorrectChain } = useWallet();

  return (
    <nav className="nav" id="main-nav">
      <Link href="/" className="nav-logo" id="nav-logo">
        Eidos<span style={{ color: 'var(--color-secondary)' }}>8004</span>
      </Link>

      <ul className="nav-links" id="nav-links">
        <li>
          <Link href="/artist" className="nav-link" id="nav-artist">
            <Palette size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Artists
          </Link>
        </li>
        <li>
          <Link href="/client" className="nav-link" id="nav-client">
            <Bot size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Clients
          </Link>
        </li>
        <li>
          <Link href="/reputation" className="nav-link" id="nav-reputation">
            <MessageSquare size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Forum
          </Link>
        </li>
        <li>
          <Link href="/analytics" className="nav-link" id="nav-analytics">
            <BarChart3 size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Analytics
          </Link>
        </li>
        <li>
          <Link href="/case-study" className="nav-link" id="nav-casestudy">
            <FileText size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Case Study
          </Link>
        </li>
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {!isCorrectChain && wallet.connected && (
          <span className="badge badge-accent" id="wrong-chain-badge">Wrong Network</span>
        )}
        {wallet.connected ? (
          <button
            className="btn btn-ghost btn-sm"
            onClick={disconnect}
            id="disconnect-wallet-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Wallet size={14} />
            {wallet.ensName || formattedAddress}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={connect}
            disabled={loading}
            id="connect-wallet-btn"
          >
            <Wallet size={14} />
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
