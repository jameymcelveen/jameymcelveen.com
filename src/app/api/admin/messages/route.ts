import { NextResponse } from 'next/server';
import { getAnalyticsPool } from '@/lib/api/analytics-events-db';
import { insightsAuthorized, insightsUnauthorized } from '@/lib/insights-auth';

export const dynamic = 'force-dynamic';

/** GET /api/admin/messages   Authorization: Bearer <admin password>. Newest contact messages. */
export async function GET(request: Request) {
  if (!insightsAuthorized(request)) return insightsUnauthorized();
  const pool = getAnalyticsPool();
  if (!pool) return NextResponse.json({ connected: false, items: [] });
  try {
    const res = await pool.query(
      `SELECT id::text, created_at, name, email, company, message, emailed
         FROM contact_messages ORDER BY created_at DESC LIMIT 100`
    );
    return NextResponse.json(
      { connected: true, items: res.rows },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[admin] messages query failed', err);
    return NextResponse.json({ connected: false, items: [] });
  }
}
