import { NextResponse } from 'next/server';
import { getAnalyticsPool, queryTopQuestions } from '@/lib/api/analytics-events-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!getAnalyticsPool()) {
    return NextResponse.json({ connected: false, items: [] });
  }
  const items = await queryTopQuestions(30);
  return NextResponse.json({ connected: true, items });
}
