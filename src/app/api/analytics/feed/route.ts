import { NextResponse } from 'next/server';
import { getAnalyticsPool, queryRecentQuestions } from '@/lib/api/analytics-events-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!getAnalyticsPool()) {
    console.error('[analytics] DATABASE_URL is not configured');
    return NextResponse.json({ connected: false, items: [] });
  }
  try {
    const items = await queryRecentQuestions(50);
    return NextResponse.json({ connected: true, items });
  } catch (err) {
    console.error('[analytics] feed query failed', err);
    return NextResponse.json({ connected: false, items: [] });
  }
}
