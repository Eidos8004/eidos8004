'use client';

import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, DollarSign, Users, Activity,
  ArrowUpRight, ArrowDownRight, Clock, Image as ImageIcon
} from 'lucide-react';

// Demo analytics data
const REVENUE_DATA = [
  { month: 'Sep', amount: 0.12 },
  { month: 'Oct', amount: 0.28 },
  { month: 'Nov', amount: 0.45 },
  { month: 'Dec', amount: 0.38 },
  { month: 'Jan', amount: 0.67 },
  { month: 'Feb', amount: 0.89 },
  { month: 'Mar', amount: 1.24 },
];

const TOP_DESIGNS = [
  { name: 'Minimal UI Kit', attributions: 12, revenue: '0.45', trend: 15 },
  { name: 'Cyberpunk Dashboard', attributions: 8, revenue: '0.72', trend: 22 },
  { name: 'Japanese Garden UI', attributions: 5, revenue: '0.32', trend: -5 },
];

const RECENT_PAYMENTS = [
  { design: 'Minimal UI Kit', artifact: 'Color Palette', amount: '0.03', agent: 'DesignSeeker', time: '2 min ago' },
  { design: 'Cyberpunk Dashboard', artifact: 'Chart Styles', amount: '0.04', agent: 'GPT-Designer', time: '15 min ago' },
  { design: 'Minimal UI Kit', artifact: 'Typography System', amount: '0.03', agent: 'DesignSeeker', time: '15 min ago' },
  { design: 'Japanese Garden UI', artifact: 'Nature Palette', amount: '0.04', agent: 'Monet.AI', time: '1 hour ago' },
  { design: 'Cyberpunk Dashboard', artifact: 'Neon Color Scheme', amount: '0.04', agent: 'VisionAgent', time: '3 hours ago' },
];

const maxRevenue = Math.max(...REVENUE_DATA.map(d => d.amount));

export default function AnalyticsPage() {
  return (
    <div className="section" id="analytics-page">
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
        <BarChart3 size={28} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary)' }} />
        Analytics Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
        Track your royalty earnings, attributions, and platform activity in real time
      </p>

      {/* Top Stats */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { icon: DollarSign, label: 'Total Revenue', value: '1.49 ETH', subvalue: '$4,023.78', change: '+24%', positive: true, color: 'var(--color-success)' },
          { icon: Activity, label: 'Total Attributions', value: '25', subvalue: 'across 3 designs', change: '+18%', positive: true, color: 'var(--color-primary)' },
          { icon: Users, label: 'Unique Agent Clients', value: '8', subvalue: 'last 30 days', change: '+33%', positive: true, color: 'var(--color-secondary)' },
          { icon: ImageIcon, label: 'Artifacts Monetized', value: '15/15', subvalue: '100% utilization', change: '0%', positive: true, color: 'var(--color-accent)' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="widget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <stat.icon size={20} style={{ color: stat.color }} />
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 600,
                color: stat.positive ? 'var(--color-success)' : 'var(--color-error)',
                display: 'flex', alignItems: 'center', gap: '2px',
              }}>
                {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </span>
            </div>
            <div className="widget-title" style={{ marginTop: 'var(--space-3)' }}>{stat.label}</div>
            <div className="widget-value" style={{ color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              {stat.subvalue}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Top Designs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Revenue Chart (CSS-based bar chart) */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          id="revenue-chart"
        >
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
            <TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--color-success)' }} />
            Revenue Trend (ETH)
          </h3>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)',
            height: '200px', padding: '0 var(--space-2)',
          }}>
            {REVENUE_DATA.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                  {d.amount.toFixed(2)}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.amount / maxRevenue) * 160}px` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                  style={{
                    width: '100%',
                    background: i === REVENUE_DATA.length - 1 ? 'var(--gradient-primary)' : 'rgba(108, 92, 231, 0.3)',
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    minHeight: '4px',
                  }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Designs */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          id="top-designs"
        >
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Top Performing Designs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {TOP_DESIGNS.map((design, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{design.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {design.attributions} attributions
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-secondary)', fontSize: 'var(--text-sm)' }}>
                    {design.revenue} ETH
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: 600,
                    color: design.trend >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px',
                  }}>
                    {design.trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(design.trend)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Payments Table */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        id="recent-payments"
      >
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Recent Attribution Payments
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
                {['Design', 'Artifact', 'Amount', 'Agent', 'Time'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_PAYMENTS.map((payment, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: 'background var(--transition-fast)',
                }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    {payment.design}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {payment.artifact}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-secondary)', fontSize: 'var(--text-sm)' }}>
                    {payment.amount} ETH
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {payment.agent}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {payment.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
