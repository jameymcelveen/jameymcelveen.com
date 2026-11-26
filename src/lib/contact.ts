/** Validation and email text for the /contact form. No server-only imports, so it is testable. */

export type ContactMessage = { name: string; email: string; company: string; message: string };

export type ContactResult =
  | { ok: true; contact: ContactMessage }
  | { ok: false; error: string; spam?: boolean };

export const CONTACT_LIMITS = { name: 80, email: 254, company: 160, message: 5000 } as const;

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

function oneLine(value: unknown, max: number): string {
  return typeof value === 'string'
    ? value.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : '';
}

/** `website` is a honeypot field: people never see it, bots fill it in. */
export function validateContact(body: unknown): ContactResult {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Invalid request.' };
  const b = body as Record<string, unknown>;
  if (typeof b.website === 'string' && b.website.trim()) {
    return { ok: false, error: 'Invalid request.', spam: true };
  }

  const name = oneLine(b.name, CONTACT_LIMITS.name);
  const email = oneLine(b.email, CONTACT_LIMITS.email);
  const company = oneLine(b.company, CONTACT_LIMITS.company);
  const message =
    typeof b.message === 'string'
      ? b.message
          .replace(CONTROL, '')
          .replace(/\r\n?/g, '\n')
          .trim()
          .slice(0, CONTACT_LIMITS.message)
      : '';

  if (!name) return { ok: false, error: 'Please add your name.' };
  if (!email) return { ok: false, error: 'Please add your email so I can reply.' };
  if (!EMAIL.test(email)) return { ok: false, error: 'That email address does not look right.' };
  if (message.length < 2) return { ok: false, error: 'Please add a message.' };

  return { ok: true, contact: { name, email, company, message } };
}

/** Plain text only, so nothing a visitor types can become markup in the inbox. */
export function formatContactEmail(
  c: ContactMessage,
  sentAt: Date = new Date()
): { subject: string; text: string } {
  const subject =
    `jameymcelveen.com: message from ${c.name}${c.company ? ` (${c.company})` : ''}`.slice(0, 150);
  const text = [
    'New message from the contact form on jameymcelveen.com.',
    '',
    `Name: ${c.name}`,
    `Email: ${c.email}`,
    `Company or role: ${c.company || '(not given)'}`,
    `Sent: ${sentAt.toISOString()}`,
    '',
    'Reply to this email to answer them.',
    '',
    '--- Message ---',
    c.message,
  ].join('\n');
  return { subject, text };
}
