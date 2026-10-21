import { NextResponse } from 'next/server';
import { getAnalyticsPool, queryTopQuestions } from '@/lib/api/analytics-events-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!getAnalyticsPool()) {
    console.error('[analytics] DATABASE_URL is not configured');
    return NextResponse.json({ connected: false, items: [] });
  }
  try {
    const items = await queryTopQuestions(30);
    return NextResponse.json({ connected: true, items });
  } catch (err) {
    console.error('[analytics] questions query failed', err);
    return NextResponse.json({ connected: false, items: [] });
  }
}
