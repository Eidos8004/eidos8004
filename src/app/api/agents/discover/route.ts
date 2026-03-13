import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/agents/discover?query=...&category=...&tags=...
 * Discovers designs matching client criteria.
 * In production, queries the on-chain DesignRegistry.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';

  // Demo design catalog
  const designs = [
    {
      id: 1,
      title: 'Minimal UI Kit',
      artist: '0x742d...1a3e',
      category: 'UI Design',
      tags: ['minimal', 'fintech', 'clean'],
      thresholdPrice: '0.15',
      artifactCount: 5,
      reputationScore: 92,
      imageUrl: null,
    },
    {
      id: 2,
      title: 'Cyberpunk Dashboard',
      artist: '0xab12...ff91',
      category: 'Dashboard',
      tags: ['cyberpunk', 'data-viz', 'neon'],
      thresholdPrice: '0.24',
      artifactCount: 6,
      reputationScore: 88,
      imageUrl: null,
    },
    {
      id: 3,
      title: 'Japanese Garden UI',
      artist: '0x5f67...c4d2',
      category: 'Mobile',
      tags: ['japanese', 'nature', 'zen'],
      thresholdPrice: '0.16',
      artifactCount: 4,
      reputationScore: 85,
      imageUrl: null,
    },
    {
      id: 4,
      title: 'Brutalist Portfolio',
      artist: '0x891f...b2c7',
      category: 'Portfolio',
      tags: ['brutalist', 'bold', 'typography'],
      thresholdPrice: '0.12',
      artifactCount: 3,
      reputationScore: 79,
      imageUrl: null,
    },
  ];

  // Simple filtering
  let results = designs;
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.tags.some(t => t.includes(q)) ||
      d.category.toLowerCase().includes(q)
    );
  }
  if (category) {
    results = results.filter(d => d.category.toLowerCase() === category.toLowerCase());
  }

  return NextResponse.json({
    success: true,
    data: {
      designs: results,
      total: results.length,
    },
  });
}
