'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import {
  Bot, Send, Search, ArrowRight, Loader, Zap,
  Image as ImageIcon, DollarSign, CheckCircle2, MessageSquare
} from 'lucide-react';
import type { NegotiationMessage } from '@/types';

// Simulated negotiation messages
const DEMO_NEGOTIATION: NegotiationMessage[] = [
  {
    id: '1', sender: 'client', agentName: 'DesignSeeker',
    content: 'I need a minimalist UI kit with a clean color palette and modern typography for a fintech dashboard.',
    timestamp: Date.now() - 30000,
  },
  {
    id: '2', sender: 'artist', agentName: 'Aurora.AI',
    content: 'I represent @aurora_designs\' "Minimal UI Kit". This design has exactly what you need: a refined 8-color palette optimized for fintech readability, Inter-based typography scale, and modular card layouts. The color palette artifact (0.03 ETH) and typography system (0.03 ETH) directly match your brief.',
    timestamp: Date.now() - 25000, artifactIds: [0, 1],
  },
  {
    id: '3', sender: 'artist', agentName: 'NeoDesign.AI',
    content: 'Let me pitch @neo_designer\'s "Cyberpunk Dashboard". While it\'s more expressive, the data visualization patterns and chart styles are industry-leading for financial data. The chart styles artifact (0.04 ETH) has 12 unique visualization templates perfect for fintech.',
    timestamp: Date.now() - 20000, artifactIds: [1],
  },
  {
    id: '4', sender: 'client', agentName: 'DesignSeeker',
    content: 'Aurora.AI makes a strong case for the color palette and typography. The fintech optimization is exactly what I need. However, NeoDesign.AI\'s chart styles are compelling for the dashboard section. Can I combine artifacts from both?',
    timestamp: Date.now() - 15000,
  },
  {
    id: '5', sender: 'artist', agentName: 'Aurora.AI',
    content: 'Absolutely! Cross-design artifact selection is a core feature. I recommend: Color Palette (0.03 ETH) + Typography System (0.03 ETH) from Minimal UI Kit. Total: 0.06 ETH for the foundational design elements.',
    timestamp: Date.now() - 10000, priceOffer: '0.06',
  },
  {
    id: '6', sender: 'artist', agentName: 'NeoDesign.AI',
    content: 'And Chart Styles (0.04 ETH) from Cyberpunk Dashboard for the data visualization layer. Combined with Aurora\'s selections, your total would be 0.10 ETH for a comprehensive fintech design foundation.',
    timestamp: Date.now() - 5000, priceOffer: '0.04',
  },
  {
    id: '7', sender: 'client', agentName: 'DesignSeeker',
    content: 'Deal! Initiating x402 payment for 3 artifacts across 2 designs. Total: 0.10 ETH. Attribution will be recorded on-chain.',
    timestamp: Date.now(), priceOffer: '0.10',
  },
];

export default function ClientPage() {
  const { wallet, connect, loading } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate negotiation
  const startNegotiation = () => {
    if (!prompt.trim()) return;
    setIsNegotiating(true);
    setMessages([]);
    setMessageIndex(0);
    setShowResult(false);
  };

  useEffect(() => {
    if (!isNegotiating) return;
    if (messageIndex >= DEMO_NEGOTIATION.length) {
      setTimeout(() => setShowResult(true), 1000);
      setIsNegotiating(false);
      return;
    }

    const timer = setTimeout(() => {
      setMessages(prev => [...prev, DEMO_NEGOTIATION[messageIndex]]);
      setMessageIndex(prev => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isNegotiating, messageIndex]);

  if (!wallet.connected) {
    return (
      <section className="hero" id="client-connect" style={{ minHeight: '80vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: 'var(--radius-2xl)',
            background: 'var(--gradient-secondary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-6)',
          }}>
            <Bot size={36} color="var(--color-text-inverse)" />
          </div>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            Client Portal
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>
            Describe what you need in plain language. Your AI agent will discover
            the best designs, negotiate with artist agents, and handle attribution payments.
          </p>
          <button className="btn btn-secondary btn-lg" onClick={connect} disabled={loading} id="client-connect-btn">
            {loading ? 'Connecting...' : 'Connect Wallet to Start'}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <div className="section" id="client-dashboard">
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
        Design Discovery
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
        Describe your design needs. AI agents will negotiate the best artifacts for you.
      </p>

      {/* Prompt Input */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-8)' }} id="client-prompt-area">
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'block' }}>
              Design Brief
            </label>
            <textarea
              className="input-field"
              placeholder="e.g. I need a minimalist UI kit with a clean color palette and modern typography for a fintech dashboard..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
              id="design-brief-input"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={startNegotiation}
            disabled={isNegotiating || !prompt.trim()}
            id="start-negotiation-btn"
            style={{ minWidth: '140px' }}
          >
            {isNegotiating ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Negotiating...
              </>
            ) : (
              <>
                <Search size={16} />
                Find Designs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Negotiation Arena */}
      {(messages.length > 0 || isNegotiating) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <MessageSquare size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
              Agent Negotiation Arena
            </h2>
            {isNegotiating && (
              <span className="badge badge-success" style={{ animation: 'pulse-bg 2s ease-in-out infinite' }}>
                LIVE
              </span>
            )}
          </div>

          {/* Agent Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div className="agent-avatar client">C</div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>DesignSeeker (Your Agent)</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div className="agent-avatar artist" style={{ fontSize: 'var(--text-xs)' }}>A1</div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Aurora.AI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div className="agent-avatar artist" style={{ fontSize: 'var(--text-xs)', background: 'var(--gradient-accent)' }}>A2</div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>NeoDesign.AI</span>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="agent-chat" ref={chatRef} id="negotiation-chat">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`agent-message ${msg.sender}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`agent-avatar ${msg.sender}`}>
                    {msg.sender === 'client' ? 'C' : msg.agentName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      {msg.agentName}
                    </div>
                    <div className={`agent-bubble ${msg.sender}`}>
                      {msg.content}
                      {msg.priceOffer && (
                        <div style={{
                          marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)',
                          background: 'rgba(0, 184, 148, 0.15)', borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: 'var(--color-success)',
                        }}>
                          <DollarSign size={12} style={{ verticalAlign: 'middle' }} /> {msg.priceOffer} ETH
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isNegotiating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>Agents are thinking...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Result */}
      {showResult && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 'var(--space-6)',
            border: '1px solid rgba(0, 184, 148, 0.3)',
          }}
          id="negotiation-result"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Negotiation Complete</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Selected Artifacts</div>
              <div className="artifact-list">
                <div className="artifact-item">
                  <span className="artifact-name">Color Palette <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>from Minimal UI Kit</span></span>
                  <span className="artifact-price">0.03 ETH</span>
                </div>
                <div className="artifact-item">
                  <span className="artifact-name">Typography System <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>from Minimal UI Kit</span></span>
                  <span className="artifact-price">0.03 ETH</span>
                </div>
                <div className="artifact-item">
                  <span className="artifact-name">Chart Styles <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>from Cyberpunk Dashboard</span></span>
                  <span className="artifact-price">0.04 ETH</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Payment Summary</div>
              <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal (3 artifacts)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>0.10 ETH</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Protocol fee</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-success)' }}>0.00 ETH</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-glass-border)', margin: 'var(--space-3) 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-secondary)', fontSize: 'var(--text-xl)' }}>0.10 ETH</span>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)' }} id="pay-attribution-btn">
                <Zap size={16} />
                Pay via x402 & Record Attribution
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
