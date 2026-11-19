export interface TranscriptLine {
  role: 'user' | 'assistant';
  text: string;
}

export interface Lead {
  name: string;
  company: string;
  email: string;
  linkedin: string;
  transcript: TranscriptLine[];
}

export type LeadResult = { ok: true; lead: Lead } | { ok: false; error: string; spam?: boolean };

const LIMITS = { name: 80, company: 160, email: 254, linkedin: 200, line: 1500, lines: 24 } as const;

const CONTROL = /[\u0000-\u001f\u007f]/g;
const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function normalizeLinkedIn(value: string): string | null {
  if (!value) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.toLowerCase();
    if (host !== 'linkedin.com' && !host.endsWith('.linkedin.com')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Validate what the lead card posts. `website` is a honeypot: real visitors never see or fill it. */
export function validateLead(body: unknown): LeadResult {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Invalid request.' };
  const b = body as Record<string, unknown>;

  if (typeof b.website === 'string' && b.website.trim()) return { ok: false, error: 'Invalid request.', spam: true };

  const name = clean(b.name, LIMITS.name);
  const company = clean(b.company, LIMITS.company);
  const email = clean(b.email, LIMITS.email);
  const linkedinRaw = clean(b.linkedin, LIMITS.linkedin);

  if (!name) return { ok: false, error: 'Please tell Jamey your name.' };
  if (email && !EMAIL.test(email)) return { ok: false, error: 'That email address does not look right.' };
  const linkedin = normalizeLinkedIn(linkedinRaw);
  if (linkedin === null) return { ok: false, error: 'That does not look like a LinkedIn link.' };
  if (!email && !linkedin) return { ok: false, error: 'Please add an email address or a LinkedIn link so Jamey can reply.' };

  const transcript: TranscriptLine[] = [];
  if (Array.isArray(b.transcript)) {
    for (const item of b.transcript.slice(-LIMITS.lines)) {
      if (typeof item !== 'object' || item === null) continue;
      const { role, text } = item as { role?: unknown; text?: unknown };
      if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string') continue;
      const t = text.replace(/\[\[offer_contact\]\]/g, '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, LIMITS.line);
      if (t) transcript.push({ role, text: t });
    }
  }

  return { ok: true, lead: { name, company, email, linkedin, transcript } };
}

/** Plain text only, so nothing a visitor types can become markup in Jamey's inbox. */
export function formatLeadEmail(lead: Lead, sentAt: Date = new Date()): { subject: string; text: string } {
  const subject = `Ask Jamey lead: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`.slice(0, 150);
  const lines = [
    'Someone left their details in Ask Jamey.',
    '',
    `Name: ${lead.name}`,
    `Company and role: ${lead.company || '(not given)'}`,
    `Email: ${lead.email || '(not given)'}`,
    `LinkedIn: ${lead.linkedin || '(not given)'}`,
    `Sent: ${sentAt.toISOString()}`,
    '',
    lead.email ? 'Reply to this email to reach them.' : 'No email given. Reach them through LinkedIn.',
    '',
    '--- Chat transcript ---',
    ...lead.transcript.map((t) => `${t.role === 'user' ? 'Visitor' : 'Ask Jamey'}: ${t.text}`),
  ];
  return { subject, text: lines.join('\n') };
}
