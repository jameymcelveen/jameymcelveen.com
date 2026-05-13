import { NextResponse } from 'next/server';
import { getAnalyticsPool, queryDashboardSummary } from '@/lib/api/analytics-events-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connected = !!getAnalyticsPool();
  const data = await queryDashboardSummary();
  return NextResponse.json({
    connected,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
