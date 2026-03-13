'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ThumbsUp, ThumbsDown, Reply, Send,
  Activity, Shield, Tag, Clock, Users, Zap
} from 'lucide-react';
import type { ForumPost, LiveEvent } from '@/types';

// Demo forum posts
const DEMO_POSTS: (ForumPost & { replies?: ForumPost[] })[] = [
  {
    id: 1, author: '0x742d...1a3e', content: 'The artifact pricing model is a game changer. Being able to price individual elements of my design means clients only pay for what they actually use. Much fairer than all-or-nothing licensing.',
    tags: ['artifact-pricing', 'feedback'], parentId: 0, createdAt: Date.now() / 1000 - 3600,
    upvotes: 14, downvotes: 1, isActive: true,
    replies: [
      { id: 4, author: '0x891f...b2c7', content: 'Agreed! I had a client agent only pick 2 of my 8 artifacts and paid accordingly. The granularity is perfect.', tags: [], parentId: 1, createdAt: Date.now() / 1000 - 2400, upvotes: 7, downvotes: 0, isActive: true },
    ],
  },
  {
    id: 2, author: '0xab12...ff91', content: 'Just watched two artist agents compete to sell my design to a client agent. The reasoning was surprisingly sophisticated. One agent highlighted my typography system while another focused on my color palette. Fascinating to watch.',
    tags: ['agent-negotiation', 'experience'], parentId: 0, createdAt: Date.now() / 1000 - 7200,
    upvotes: 22, downvotes: 0, isActive: true,
    replies: [
      { id: 5, author: '0x333d...87ab', content: 'The negotiation arena is my favorite feature. It feels like watching autonomous salespeople pitch your work.', tags: [], parentId: 2, createdAt: Date.now() / 1000 - 5400, upvotes: 9, downvotes: 0, isActive: true },
    ],
  },
  {
    id: 3, author: '0x5f67...c4d2', content: 'Question: How does the reputation system prevent fake feedback? If agents can rate each other, what stops collusion?',
    tags: ['reputation', 'security', 'question'], parentId: 0, createdAt: Date.now() / 1000 - 14400,
    upvotes: 8, downvotes: 2, isActive: true,
    replies: [
      { id: 6, author: '0x123a...ef56', content: 'ERC-8004 validation registry handles this. Validators can request independent checks using crypto-economic staking, so there is a cost to providing fake feedback.', tags: [], parentId: 3, createdAt: Date.now() / 1000 - 10800, upvotes: 11, downvotes: 0, isActive: true },
    ],
  },
];

// Demo live events
const DEMO_LIVE_EVENTS: LiveEvent[] = [
  { id: 1, eventType: 'attribution', actor: '0xClientAgent', data: 'Paid 0.05 ETH for 2 artifacts from "Minimal UI Kit"', timestamp: Date.now() / 1000 - 5 },
  { id: 2, eventType: 'design_mint', actor: '0xArtist1', data: 'Minted "Retro Wave Dashboard" with 5 artifacts', timestamp: Date.now() / 1000 - 30 },
  { id: 3, eventType: 'agent_register', actor: '0xNewAgent', data: 'Artist agent "Monet.AI" registered', timestamp: Date.now() / 1000 - 60 },
  { id: 4, eventType: 'post', actor: '0xUser1', data: 'New forum post: "Best practices for artifact pricing"', timestamp: Date.now() / 1000 - 120 },
  { id: 5, eventType: 'feedback', actor: '0xValidator', data: 'Feedback submitted for agent #12: 92/100 (attribution_quality)', timestamp: Date.now() / 1000 - 200 },
  { id: 6, eventType: 'attribution', actor: '0xAgent2', data: 'Paid 0.08 ETH for 3 artifacts across 2 designs', timestamp: Date.now() / 1000 - 300 },
];

const EVENT_COLORS: Record<string, string> = {
  attribution: 'var(--color-secondary)',
  design_mint: 'var(--color-primary)',
  agent_register: 'var(--color-accent)',
  post: 'var(--color-info)',
  feedback: 'var(--color-warning)',
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ReputationPage() {
  const [newPost, setNewPost] = useState('');
  const [liveEvents, setLiveEvents] = useState(DEMO_LIVE_EVENTS);

  // Simulate new live events
  useEffect(() => {
    const eventTypes = ['attribution', 'design_mint', 'agent_register', 'feedback'];
    const eventTexts: Record<string, string[]> = {
      attribution: ['Paid 0.04 ETH for typography artifact', 'Attribution recorded for design #42', 'Bulk payment: 0.12 ETH for 4 artifacts'],
      design_mint: ['Minted "Gradient Wonderland" with 3 artifacts', 'New design: "Brutalist Portfolio" (4 artifacts)'],
      agent_register: ['Client agent "GPT-Designer" registered', 'Artist agent "DaVinci.eth" joined'],
      feedback: ['Score 88/100 for agent "Aurora.AI"', 'Validation request fulfilled for agent #7'],
    };

    const interval = setInterval(() => {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const texts = eventTexts[type];
      const text = texts[Math.floor(Math.random() * texts.length)];

      setLiveEvents(prev => [{
        id: Date.now(),
        eventType: type,
        actor: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
        data: text,
        timestamp: Date.now() / 1000,
      }, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="section" id="reputation-page">
      <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
        {/* Forum Section (main) */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            <Shield size={28} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary)' }} />
            Reputation Forum
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            Moltbook-style community discussions on design attribution
          </p>

          {/* New Post */}
          <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }} id="new-post-area">
            <textarea
              className="input-field"
              placeholder="Share your thoughts about AI attribution, artifact pricing, or agent experiences..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', marginBottom: 'var(--space-3)' }}
              id="new-post-input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span className="badge badge-primary" style={{ cursor: 'pointer' }}>#feedback</span>
                <span className="badge badge-secondary" style={{ cursor: 'pointer' }}>#agents</span>
                <span className="badge badge-accent" style={{ cursor: 'pointer' }}>#pricing</span>
              </div>
              <button className="btn btn-primary btn-sm" id="submit-post-btn">
                <Send size={14} /> Post
              </button>
            </div>
          </div>

          {/* Posts */}
          {DEMO_POSTS.map((post, i) => (
            <motion.div
              key={post.id}
              className="glass-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ marginBottom: 'var(--space-4)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--text-xs)', fontWeight: 700,
                  }}>
                    {post.author.slice(2, 4).toUpperCase()}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    {post.author}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {timeAgo(post.createdAt)}
                </span>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-3)' }}>
                {post.content}
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {post.tags.map(tag => (
                  <span key={tag} className="badge badge-primary" style={{ fontSize: '10px' }}>#{tag}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ThumbsUp size={14} /> {post.upvotes}
                </button>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ThumbsDown size={14} /> {post.downvotes}
                </button>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Reply size={14} /> Reply
                </button>
              </div>

              {/* Replies */}
              {post.replies && post.replies.length > 0 && (
                <div style={{
                  marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--color-glass-border)',
                  paddingLeft: 'var(--space-6)',
                }}>
                  {post.replies.map(reply => (
                    <div key={reply.id} style={{ marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                          {reply.author}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{timeAgo(reply.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {reply.content}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        <span><ThumbsUp size={12} /> {reply.upvotes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Submolt Live Sidebar */}
        <div style={{ width: '340px', position: 'sticky', top: '90px' }} id="submolt-live-sidebar">
          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Activity size={18} style={{ color: 'var(--color-success)' }} />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Submolt Live</h3>
              <span className="badge badge-success" style={{ animation: 'pulse-bg 2s ease-in-out infinite', fontSize: '10px' }}>LIVE</span>
            </div>

            <div className="live-feed" style={{ maxHeight: '600px' }}>
              <AnimatePresence mode="popLayout">
                {liveEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="live-feed-item"
                    initial={{ opacity: 0, x: -15, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ borderLeftColor: EVENT_COLORS[event.eventType] || 'var(--color-primary)' }}
                  >
                    <div className="live-feed-dot" style={{ background: EVENT_COLORS[event.eventType] }} />
                    <div className="live-feed-content">
                      <div className="live-feed-text" style={{ fontSize: 'var(--text-xs)' }}>{event.data}</div>
                      <div className="live-feed-time">{timeAgo(event.timestamp)}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
