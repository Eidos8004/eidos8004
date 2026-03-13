'use client';

import { motion } from 'framer-motion';
import {
  Scale, AlertTriangle, DollarSign, TrendingUp, Calendar,
  ExternalLink, Users, Gavel, FileText, BookOpen
} from 'lucide-react';

const CASE_STUDIES = [
  {
    year: 2024,
    category: 'lawsuit',
    title: 'Class-Action Lawsuit: 10+ Visual Artists vs Stability AI, Midjourney, DeviantArt',
    description: 'A California judge allowed a class-action lawsuit by ten visual artists to proceed against major AI companies. The artists allege their copyrighted works were used to train text-to-image AI models like Stable Diffusion without permission or compensation.',
    impact: 'Ongoing',
    source: 'hyperallergic.com',
    icon: Gavel,
  },
  {
    year: 2024,
    category: 'complaint',
    title: 'Greg Rutkowski: "I Can\'t Compete with My Own Stolen Style"',
    description: 'Polish digital artist Greg Rutkowski became one of the most-used prompts on Stable Diffusion without his consent. His name was used to generate images mimicking his distinctive fantasy art style, diluting his own market.',
    impact: 'Individual, widespread',
    source: 'Widely reported',
    icon: Users,
  },
  {
    year: 2024,
    category: 'regulation',
    title: 'U.S. Copyright Office: AI-Generated Works Lack Human Authorship',
    description: 'The Copyright Office consistently reinforced that purely AI-generated works are not eligible for copyright protection, clarifying the legal gray area around AI outputs. This raises questions about training data compensation.',
    impact: 'Regulatory precedent',
    source: 'copyright.gov',
    icon: FileText,
  },
  {
    year: 2025,
    category: 'settlement',
    title: 'Anthropic: $1.5 Billion Settlement for Pirated Training Data',
    description: 'AI company Anthropic settled for $1.5 billion after it was revealed they used pirated books to train their Claude models. This landmark settlement established legal precedent for compensating creators whose copyrighted work is used in AI training.',
    impact: '$1,500,000,000',
    source: 'Multiple sources',
    icon: DollarSign,
  },
  {
    year: 2025,
    category: 'complaint',
    title: 'Illustrators\' Guild: 78% of Members Report Lost Revenue Due to AI',
    description: 'A survey by the Society of Illustrators found that 78% of professional illustrators experienced significant revenue decline attributable to AI-generated alternatives undercutting their pricing in the commercial market.',
    impact: '78% of illustrators affected',
    source: 'Society of Illustrators',
    icon: TrendingUp,
  },
  {
    year: 2025,
    category: 'lawsuit',
    title: 'Getty Images vs Stability AI: Unauthorized Use of 12M+ Images',
    description: 'Getty Images continued its landmark lawsuit against Stability AI for using over 12 million copyrighted images without license. The case argues "infringement by design" in how diffusion models encode and reproduce copyrighted visual elements.',
    impact: '12,000,000+ images',
    source: 'Getty Images legal filings',
    icon: Gavel,
  },
  {
    year: 2025,
    category: 'regulation',
    title: 'EU AI Act Article 53: Mandatory Training Data Transparency',
    description: 'The EU AI Act came into force requiring AI companies to disclose detailed summaries of training data, including copyrighted content. This created a new compliance burden and opened the door to systematic royalty claims.',
    impact: 'EU-wide regulation',
    source: 'EU Commission',
    icon: BookOpen,
  },
  {
    year: 2026,
    category: 'complaint',
    title: 'ArtStation Protests: 94,000+ Artists Use "No AI" Tags',
    description: 'Over 94,000 artists on ArtStation adopted "No AI Training" tags on their portfolios. Despite this, web scraping continues, and artists have no enforcement mechanism beyond social signaling.',
    impact: '94,000+ artists',
    source: 'ArtStation community data',
    icon: Users,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  lawsuit: 'var(--color-error)',
  settlement: 'var(--color-warning)',
  complaint: 'var(--color-accent)',
  regulation: 'var(--color-info)',
};

const KEY_STATS = [
  { value: '$17.1B', label: 'Estimated annual loss to artists from AI usage', color: 'var(--color-error)' },
  { value: '94,000+', label: 'Artists protesting AI training on ArtStation', color: 'var(--color-accent)' },
  { value: '78%', label: 'Illustrators reporting revenue decline', color: 'var(--color-warning)' },
  { value: '$1.5B', label: 'Largest AI training data settlement', color: 'var(--color-success)' },
  { value: '12M+', label: 'Getty Images used without license', color: 'var(--color-primary)' },
  { value: '$0', label: 'Average artist compensation from AI training', color: 'var(--color-error)' },
];

export default function CaseStudyPage() {
  return (
    <div className="section" id="case-study-page" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--space-12)' }}
      >
        <span className="badge badge-accent" style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}>
          <AlertTriangle size={12} /> Case Study
        </span>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, marginBottom: 'var(--space-4)', lineHeight: 1.1 }}>
          The Artist Attribution Crisis
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.7, maxWidth: '700px' }}>
          Artists worldwide have raised urgent concerns about AI and LLMs taking inspiration
          from their work without providing any form of royalty or compensation.
          This is not a future problem. It is happening now.
        </p>
      </motion.div>

      {/* Key Statistics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 'var(--space-12)' }}
      >
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
          By the Numbers
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {KEY_STATS.map((stat, i) => (
            <motion.div
              key={i}
              className="glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              style={{ textAlign: 'center', padding: 'var(--space-5)' }}
            >
              <div style={{
                fontSize: 'var(--text-3xl)', fontWeight: 900,
                fontFamily: 'var(--font-mono)', color: stat.color,
                marginBottom: 'var(--space-2)',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
        Timeline of Events
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {CASE_STUDIES.map((study, i) => (
          <motion.div
            key={i}
            className="glass-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            viewport={{ once: true }}
            style={{
              borderLeft: `3px solid ${CATEGORY_COLORS[study.category]}`,
              display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: '44px', height: '44px', minWidth: '44px',
              borderRadius: 'var(--radius-md)',
              background: `${CATEGORY_COLORS[study.category]}22`,
              border: `1px solid ${CATEGORY_COLORS[study.category]}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <study.icon size={20} style={{ color: CATEGORY_COLORS[study.category] }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <span className="badge" style={{
                  background: `${CATEGORY_COLORS[study.category]}22`,
                  color: CATEGORY_COLORS[study.category],
                  border: `1px solid ${CATEGORY_COLORS[study.category]}44`,
                }}>
                  {study.category}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                  {study.year}
                </span>
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)', lineHeight: 1.3 }}>
                {study.title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>
                {study.description}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <span><Scale size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> Impact: {study.impact}</span>
                <span><ExternalLink size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> {study.source}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conclusion */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          marginTop: 'var(--space-12)',
          background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(253, 121, 168, 0.1) 100%)',
          border: '1px solid rgba(108, 92, 231, 0.3)',
          textAlign: 'center',
          padding: 'var(--space-10)',
        }}
        id="case-study-conclusion"
      >
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
          This Is Why Eidos8004 Exists
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
          The agentic economy is accelerating. AI agents are becoming autonomous consumers
          of creative work. Without on-chain attribution and automated royalty payments,
          artists will be left behind. Eidos8004 bridges this gap with artifact-based pricing,
          agent-to-agent negotiation, and permanent on-chain attribution records.
        </p>
      </motion.div>
    </div>
  );
}
