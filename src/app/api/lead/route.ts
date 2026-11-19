import { NextResponse } from 'next/server';
import { checkRateLimit, resolveClientIp } from '@/lib/api/rate-limiter';
import { formatLeadEmail, validateLead } from '@/lib/api/lead';

const FALLBACK = 'I could not send that just now. Please email jamey@mcelveen.us directly.';

export async function POST(request: Request) {
  const rl = checkRateLimit(resolveClientIp(request), { namespace: 'lead-rl', maxPerHour: 3 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many messages from this network. Please email jamey@mcelveen.us.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const result = validateLead(body);
  if (!result.ok) {
    // Bots fill the honeypot. Tell them it worked so they move on.
    if (result.spam) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { lead } = result;
  const email = formatLeadEmail(lead);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.LEAD_TO_EMAIL?.trim() || 'jamey@mcelveen.us';
  const from = process.env.LEAD_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[lead] RESEND_API_KEY or LEAD_FROM_EMAIL is not set');
      return NextResponse.json({ error: FALLBACK }, { status: 503 });
    }
    console.log('[lead] (dev, not sent)', email.subject, '\n', email.text);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: email.subject,
        text: email.text,
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
    });
    if (!res.ok) {
      console.error('[lead] Resend error', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ error: FALLBACK }, { status: 502 });
    }
  } catch (err) {
    console.error('[lead] send failed', err);
    return NextResponse.json({ error: FALLBACK }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
