'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import {
  Upload, Plus, Trash2, ArrowRight, Image as ImageIcon,
  DollarSign, Tag, FileText, Loader, CheckCircle2
} from 'lucide-react';

interface ArtifactInput {
  name: string;
  description: string;
  price: string;
}

export default function UploadDesignPage() {
  const { wallet, connect } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [artifacts, setArtifacts] = useState<ArtifactInput[]>([
    { name: '', description: '', price: '' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addArtifact = () => {
    setArtifacts([...artifacts, { name: '', description: '', price: '' }]);
  };

  const removeArtifact = (index: number) => {
    if (artifacts.length <= 1) return;
    setArtifacts(artifacts.filter((_, i) => i !== index));
  };

  const updateArtifact = (index: number, field: keyof ArtifactInput, value: string) => {
    const updated = [...artifacts];
    updated[index] = { ...updated[index], [field]: value };
    setArtifacts(updated);
  };

  const thresholdPrice = artifacts.reduce((sum, a) => {
    const price = parseFloat(a.price) || 0;
    return sum + price;
  }, 0);

  const handleSubmit = async () => {
    setUploading(true);
    // Simulated upload delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    setUploading(false);
    setSuccess(true);
  };

  if (!wallet.connected) {
    return (
      <div className="section" style={{ textAlign: 'center', paddingTop: 'var(--space-20)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
          Connect Wallet to Upload
        </h1>
        <button className="btn btn-primary btn-lg" onClick={connect} id="upload-connect-btn">
          Connect Wallet <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="section" style={{ textAlign: 'center', paddingTop: 'var(--space-20)' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle2 size={72} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-6)' }} />
        </motion.div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
          Design Uploaded Successfully!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Your design has been minted as an NFT with {artifacts.length} artifacts.
          <br />
          Threshold price: {thresholdPrice.toFixed(4)} ETH
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => setSuccess(false)} id="upload-another-btn">
          Upload Another Design
        </button>
      </div>
    );
  }

  return (
    <div className="section" id="upload-page" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
        <Upload size={28} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary)' }} />
        Upload Design
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
        Define your design and its artifacts with individual pricing
      </p>

      {/* Design Info */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Design Information
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)', display: 'block' }}>
              Design Title *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Minimal Fintech UI Kit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="design-title-input"
            />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)', display: 'block' }}>
              Description *
            </label>
            <textarea
              className="input-field"
              placeholder="Describe your design and what makes it unique..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              id="design-description-input"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)', display: 'block' }}>
                Category *
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                id="design-category-select"
              >
                <option value="">Select category</option>
                <option value="UI Design">UI Design</option>
                <option value="Dashboard">Dashboard</option>
                <option value="Mobile">Mobile</option>
                <option value="Logo">Logo</option>
                <option value="Illustration">Illustration</option>
                <option value="Typography">Typography</option>
                <option value="Icon Set">Icon Set</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)', display: 'block' }}>
                Tags (comma-separated)
              </label>
              <input
                className="input-field"
                placeholder="e.g. minimal, fintech, modern"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                id="design-tags-input"
              />
            </div>
          </div>

          {/* File Upload Zone */}
          <div style={{
            border: '2px dashed var(--color-glass-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-10)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
          }}
            id="file-upload-zone"
          >
            <ImageIcon size={36} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Drag & drop design assets here or click to browse
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
              PNG, JPG, SVG, or Figma export (max 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Artifacts */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>
            <Tag size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Design Artifacts
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={addArtifact} id="add-artifact-btn">
            <Plus size={14} /> Add Artifact
          </button>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Break your design into distinct visual elements. Each artifact has its own price.
          Clients only pay for the specific artifacts they take inspiration from.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {artifacts.map((artifact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 'var(--space-4)',
                background: 'var(--color-bg-glass)',
                border: '1px solid var(--color-glass-border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Artifact #{i + 1}
                </span>
                {artifacts.length > 1 && (
                  <button
                    onClick={() => removeArtifact(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 'var(--space-3)' }}>
                <input
                  className="input-field"
                  placeholder="e.g. Color Palette"
                  value={artifact.name}
                  onChange={(e) => updateArtifact(i, 'name', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Brief description"
                  value={artifact.description}
                  onChange={(e) => updateArtifact(i, 'description', e.target.value)}
                />
                <input
                  className="input-field"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="ETH"
                  value={artifact.price}
                  onChange={(e) => updateArtifact(i, 'price', e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Threshold Price Summary */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(0, 206, 201, 0.1) 0%, rgba(108, 92, 231, 0.1) 100%)',
        border: '1px solid rgba(0, 206, 201, 0.3)',
        marginBottom: 'var(--space-6)',
      }} id="threshold-summary">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>
              Threshold Price (sum of all artifacts)
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-secondary)' }}>
              {thresholdPrice.toFixed(4)} ETH
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {artifacts.filter(a => a.name).length} artifacts defined
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
        onClick={handleSubmit}
        disabled={uploading || !title || !description || artifacts.some(a => !a.name || !a.price)}
        id="mint-design-btn"
      >
        {uploading ? (
          <>
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Minting Design NFT...
          </>
        ) : (
          <>
            <Upload size={18} />
            Mint Design NFT with {artifacts.length} Artifact{artifacts.length > 1 ? 's' : ''}
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
