import { NextResponse } from 'next/server';
import { getAnalyticsPool } from '@/lib/api/analytics-events-db';
import { checkRateLimit, resolveClientIp } from '@/lib/api/rate-limiter';
import { formatContactEmail, validateContact, type ContactMessage } from '@/lib/contact';

export const dynamic = 'force-dynamic';

const FALLBACK = 'That did not go through. Please email jamey@mcelveen.us directly.';

async function store(c: ContactMessage): Promise<number | null> {
  const pool = getAnalyticsPool();
  if (!pool) return null;
  try {
    const res = await pool.query<{ id: string }>(
      'INSERT INTO contact_messages (name, email, company, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [c.name, c.email, c.company, c.message]
    );
    return Number(res.rows[0]?.id ?? 0) || null;
  } catch (err) {
    console.error('[contact] store failed', err);
    return null;
  }
}

/** Email through Resend when RESEND_API_KEY and CONTACT_FROM_EMAIL are set. */
async function email(c: ContactMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim() || 'jamey@mcelveen.us';
  if (!apiKey || !from) return false;
  const { subject, text } = formatContactEmail(c);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, reply_to: c.email }),
    });
    if (!res.ok) {
      console.error('[contact] Resend error', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[contact] send failed', err);
    return false;
  }
}

export async function POST(request: Request) {
  const rl = checkRateLimit(resolveClientIp(request), { namespace: 'contact-rl', maxPerHour: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many messages from this network. Please email jamey@mcelveen.us.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const result = validateContact(body);
  if (!result.ok) {
    // Bots fill the honeypot. Tell them it worked so they move on.
    if (result.spam) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const id = await store(result.contact);
  const sent = await email(result.contact);
  if (id && sent) {
    await getAnalyticsPool()
      ?.query('UPDATE contact_messages SET emailed = true WHERE id = $1', [id])
      .catch(() => undefined);
  }
  if (!id && !sent) {
    console.error('[contact] neither stored nor emailed');
    return NextResponse.json({ error: FALLBACK }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
