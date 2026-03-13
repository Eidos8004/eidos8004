'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import {
  Upload, Eye, DollarSign, Layers, Plus,
  ArrowRight, Image as ImageIcon, Tag, TrendingUp
} from 'lucide-react';

// Demo portfolio data
const DEMO_DESIGNS = [
  {
    id: 1, title: 'Minimal UI Kit', category: 'UI Design', image: '/demo/ui-kit.jpg',
    thresholdPrice: '0.15', artifactCount: 5,
    artifacts: [
      { name: 'Color Palette', price: '0.03' },
      { name: 'Typography System', price: '0.03' },
      { name: 'Button Components', price: '0.03' },
      { name: 'Card Layouts', price: '0.03' },
      { name: 'Icon Set', price: '0.03' },
    ],
    earnings: '0.45',
    attributions: 12,
  },
  {
    id: 2, title: 'Cyberpunk Dashboard', category: 'Dashboard', image: '/demo/dashboard.jpg',
    thresholdPrice: '0.24', artifactCount: 6,
    artifacts: [
      { name: 'Neon Color Scheme', price: '0.04' },
      { name: 'Chart Styles', price: '0.04' },
      { name: 'Data Grid Layout', price: '0.04' },
      { name: 'Sidebar Navigation', price: '0.04' },
      { name: 'Widget Components', price: '0.04' },
      { name: 'Animation Patterns', price: '0.04' },
    ],
    earnings: '0.72',
    attributions: 8,
  },
  {
    id: 3, title: 'Japanese Garden UI', category: 'Mobile', image: '/demo/garden.jpg',
    thresholdPrice: '0.16', artifactCount: 4,
    artifacts: [
      { name: 'Nature Palette', price: '0.04' },
      { name: 'Organic Layout', price: '0.04' },
      { name: 'Zen Typography', price: '0.04' },
      { name: 'Subtle Animations', price: '0.04' },
    ],
    earnings: '0.32',
    attributions: 5,
  },
];

export default function ArtistPage() {
  const { wallet, connect, loading } = useWallet();
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);

  if (!wallet.connected) {
    return (
      <section className="hero" id="artist-connect" style={{ minHeight: '80vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: 'var(--radius-2xl)',
            background: 'var(--gradient-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-6)',
          }}>
            <ImageIcon size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            Artist Portal
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>
            Upload your designs, define artifact pricing, and start earning
            royalties when AI agents take inspiration from your work.
          </p>
          <button className="btn btn-primary btn-lg" onClick={connect} disabled={loading} id="artist-connect-btn">
            {loading ? 'Connecting...' : 'Connect Wallet to Start'}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <div className="section" id="artist-dashboard">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Your Portfolio</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Manage designs, artifacts, and track your royalty earnings
          </p>
        </div>
        <Link href="/artist/upload" id="upload-design-btn">
          <button className="btn btn-primary">
            <Plus size={18} />
            Upload Design
          </button>
        </Link>
      </div>

      {/* Stats Widgets */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { icon: ImageIcon, label: 'Total Designs', value: '3', color: 'var(--color-primary)' },
          { icon: Layers, label: 'Total Artifacts', value: '15', color: 'var(--color-secondary)' },
          { icon: DollarSign, label: 'Total Earnings', value: '1.49 ETH', color: 'var(--color-success)' },
          { icon: TrendingUp, label: 'Attributions', value: '25', color: 'var(--color-accent)' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="widget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <stat.icon size={20} style={{ color: stat.color, marginBottom: 'var(--space-2)' }} />
            <div className="widget-title">{stat.label}</div>
            <div className="widget-value" style={{ color: stat.color }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Design Cards */}
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
        Your Designs
      </h2>
      <div className="design-grid" id="artist-design-grid">
        {DEMO_DESIGNS.map((design, i) => (
          <motion.div
            key={design.id}
            className="design-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => setSelectedDesign(selectedDesign === design.id ? null : design.id)}
            style={{ cursor: 'pointer' }}
          >
            {/* Placeholder image */}
            <div
              className="design-card-image"
              style={{
                background: `linear-gradient(135deg, ${i === 0 ? 'var(--color-primary)' : i === 1 ? 'var(--color-secondary)' : 'var(--color-accent)'} 0%, var(--color-bg-elevated) 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ImageIcon size={48} style={{ opacity: 0.3 }} />
            </div>

            <div className="design-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="design-card-title">{design.title}</div>
                  <div className="design-card-artist">
                    <Tag size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {design.category}
                  </div>
                </div>
                <div className="design-card-price">{design.thresholdPrice} ETH</div>
              </div>

              <div style={{
                display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)',
                fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
              }}>
                <span><Layers size={12} style={{ verticalAlign: 'middle' }} /> {design.artifactCount} artifacts</span>
                <span><Eye size={12} style={{ verticalAlign: 'middle' }} /> {design.attributions} uses</span>
                <span style={{ color: 'var(--color-success)' }}>
                  <DollarSign size={12} style={{ verticalAlign: 'middle' }} /> {design.earnings} ETH earned
                </span>
              </div>

              {/* Artifact Breakdown (expanded) */}
              {selectedDesign === design.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 'var(--space-4)' }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Artifact Breakdown
                  </div>
                  <div className="artifact-list">
                    {design.artifacts.map((artifact, j) => (
                      <div className="artifact-item" key={j}>
                        <span className="artifact-name">{artifact.name}</span>
                        <span className="artifact-price">{artifact.price} ETH</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
