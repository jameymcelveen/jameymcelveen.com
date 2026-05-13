import { NextResponse } from 'next/server';
import {
  checkAnalyticsEventRateLimit,
  isInsightEventType,
  referrerHostOnly,
  resolveGeoForRequest,
  trunc,
} from '@/lib/api/analytics-insight-ingest';
import { getAnalyticsPool, insertAnalyticsEvent, type InsightEventType } from '@/lib/api/analytics-events-db';

interface EventBody {
  event?: string;
  page?: string | null;
  question?: string | null;
  chip_label?: string | null;
  referrer?: string | null;
  device?: string | null;
  chat_duration_sec?: number | null;
  from_page?: string | null;
}

export async function POST(request: Request) {
  if (!getAnalyticsPool()) {
    return NextResponse.json({ ok: false, error: 'Analytics database not configured.' }, { status: 503 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkAnalyticsEventRateLimit(ip).allowed) {
    return NextResponse.json({ ok: false, error: 'Too many events.' }, { status: 429 });
  }

  let body: EventBody;
  try {
    body = (await request.json()) as EventBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  if (!isInsightEventType(body.event)) {
    return NextResponse.json({ ok: false, error: 'Invalid or missing event type.' }, { status: 400 });
  }

  const pagePath = trunc(body.page ?? null, 255) || (body.event === 'page_view' ? '/' : null);

  if (body.event === 'ask_jamey_question' && !String(body.question ?? '').trim()) {
    return NextResponse.json({ ok: false, error: 'Question text required.' }, { status: 400 });
  }

  if (body.event === 'chip_click' && !String(body.chip_label ?? '').trim()) {
    return NextResponse.json({ ok: false, error: 'chip_label required for chip_click.' }, { status: 400 });
  }

  const geo = resolveGeoForRequest(request);
  const refHost = referrerHostOnly(body.referrer ?? null);
  const device =
    body.device === 'mobile' || body.device === 'desktop' ? body.device : trunc(body.device, 20);

  const chatDur =
    typeof body.chat_duration_sec === 'number' && Number.isFinite(body.chat_duration_sec)
      ? Math.max(0, Math.min(86400, Math.round(body.chat_duration_sec)))
      : null;

  try {
    await insertAnalyticsEvent({
      eventType: body.event as InsightEventType,
      page: pagePath,
      question: body.event === 'ask_jamey_question' ? trunc(body.question ?? null, 8000) : null,
      chipLabel: body.event === 'chip_click' ? trunc(body.chip_label ?? null, 255) : null,
      country: geo.country,
      region: geo.region,
      referrer: refHost,
      device,
      chatDurationSec: chatDur,
      fromPage: trunc(body.from_page ?? null, 255),
    });
  } catch (e) {
    console.error('[analytics/event]', e);
    return NextResponse.json({ ok: false, error: 'Failed to store event.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
