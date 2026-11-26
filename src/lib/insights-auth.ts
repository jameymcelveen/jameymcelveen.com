import 'server-only';

import { createHash, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Password for the Site Insights dashboard and its data feeds.
 * First one set wins: INSIGHTS_PASSWORD, then ADMIN_PASSWORD (the team-wide shared
 * variable Faith Wanted uses too), then the lab's BOARD_ADMIN_KEY.
 * With none set, the dashboard stays locked for everyone.
 */
function expectedPassword(): string {
  return (
    process.env.INSIGHTS_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.BOARD_ADMIN_KEY ||
    ''
  ).trim();
}

/** True when the request carries `Authorization: Bearer <password>`. */
export function insightsAuthorized(request: Request): boolean {
  const expected = expectedPassword();
  if (!expected) return false;
  const header = request.headers.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!provided) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function insightsUnauthorized() {
  return NextResponse.json(
    { error: 'Sign in on /dashboard first.' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
}
