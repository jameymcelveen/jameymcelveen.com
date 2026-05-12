import { NextResponse } from 'next/server';
import { getStatsDashboard } from '@/lib/api/analytics-store';

export async function GET(request: Request) {
  const expected = process.env.STATS_API_KEY?.trim();
  if (!expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = request.headers.get('x-stats-key');
  if (!key || key !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dashboard = getStatsDashboard();
  return NextResponse.json(dashboard);
}
