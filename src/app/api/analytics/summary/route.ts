import { NextResponse } from 'next/server';
import { getAnalyticsPool, queryDashboardSummary } from '@/lib/api/analytics-events-db';

export const dynamic = 'force-dynamic';

const empty = {
  stats: { totalVisits: 0, askJameyChats: 0, chipClicks: 0, countries: 0, resumeViews: 0 },
  timeline: [] as { day: string; visits: number }[],
  topPages: [] as { path: string; views: number }[],
  trafficSources: [] as { source: string; count: number; percent: number }[],
  countryCounts: [] as { country: string; count: number }[],
  database: null as { usedBytes: number; limitBytes: number } | null,
};

export async function GET() {
  const updatedAt = new Date().toISOString();
  if (!getAnalyticsPool()) {
    console.error('[analytics] DATABASE_URL is not configured');
    return NextResponse.json({ connected: false, ...empty, updatedAt });
  }
  try {
    const data = await queryDashboardSummary();
    return NextResponse.json({ connected: true, ...data, updatedAt });
  } catch (err) {
    console.error('[analytics] summary query failed', err);
    return NextResponse.json({ connected: false, ...empty, updatedAt });
  }
}
