import { NextResponse } from 'next/server';
import { startSession } from '@/lib/api/analytics-store';
import { resolveClientIp } from '@/lib/api/rate-limiter';

interface StartSessionBody {
  sessionId?: string;
  visitorKey?: string;
  referrer?: string | null;
  landingPath?: string;
  userAgent?: string | null;
  acceptLanguage?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  timeZone?: string | null;
}

export async function POST(request: Request) {
  let body: StartSessionBody;
  try {
    body = (await request.json()) as StartSessionBody;
  } catch {
    return NextResponse.json(null, { status: 400 });
  }

  if (!body.sessionId || !body.visitorKey) {
    return NextResponse.json(null, { status: 400 });
  }

  const ip = resolveClientIp(request);
  const result = startSession({
    sessionId: body.sessionId,
    visitorKey: body.visitorKey,
    referrer: body.referrer,
    landingPath: body.landingPath || '/',
    userAgent: body.userAgent,
    acceptLanguage: body.acceptLanguage,
    screenWidth: body.screenWidth,
    screenHeight: body.screenHeight,
    viewportWidth: body.viewportWidth,
    viewportHeight: body.viewportHeight,
    timeZone: body.timeZone,
    ipAddress: ip,
  });

  return NextResponse.json(result);
}
