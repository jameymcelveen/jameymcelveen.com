'use client';

import { useState } from 'react';

export interface LeadFormData {
  name: string;
  company: string;
  email: string;
  linkedin: string;
  website: string; // honeypot
}

interface Props {
  /** Resolves to an error message to show, or null when the lead was sent. */
  onSubmit: (data: LeadFormData) => Promise<string | null>;
  onDismiss: () => void;
}

const FIELD =
  'ask-jamey-input text-[var(--ask-jamey-fg)] w-full px-3 py-2 text-[0.9rem] leading-normal outline-none placeholder:text-[var(--text-muted)]';

export function AskJameyLeadCard({ onSubmit, onDismiss }: Props) {
  const [data, setData] = useState<LeadFormData>({ name: '', company: '', email: '', linkedin: '', website: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  return (
    <li className="flex max-w-full justify-start">
      <form
        className="ask-jamey-msg-assistant flex w-full max-w-[90%] flex-col gap-2 px-[18px] py-[14px] text-[0.95rem] leading-[1.5]"
        onSubmit={async (e) => {
          e.preventDefault();
          if (sending) return;
          setSending(true);
          setError(null);
          const err = await onSubmit(data);
          if (err) {
            setError(err);
            setSending(false);
          }
        }}
      >
        <p className="font-semibold">Leave your details for Jamey</p>
        <label className="sr-only" htmlFor="lead-name">Your name</label>
        <input id="lead-name" className={FIELD} placeholder="Your name" autoComplete="name" required maxLength={80} value={data.name} onChange={set('name')} />
        <label className="sr-only" htmlFor="lead-company">Company and role you are hiring for</label>
        <input id="lead-company" className={FIELD} placeholder="Company and role you're hiring for" autoComplete="organization" maxLength={160} value={data.company} onChange={set('company')} />
        <label className="sr-only" htmlFor="lead-email">Email</label>
        <input id="lead-email" className={FIELD} type="email" placeholder="Email" autoComplete="email" maxLength={254} value={data.email} onChange={set('email')} />
        <label className="sr-only" htmlFor="lead-linkedin">LinkedIn link</label>
        <input id="lead-linkedin" className={FIELD} placeholder="or your LinkedIn link" autoComplete="url" maxLength={200} value={data.linkedin} onChange={set('linkedin')} />

        {/* Honeypot: hidden from people, tempting to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="lead-website">Website</label>
          <input id="lead-website" tabIndex={-1} autoComplete="off" value={data.website} onChange={set('website')} />
        </div>

        <p className="text-[var(--text-muted)] text-[11px] leading-snug">
          An email or LinkedIn link is enough. Jamey gets what you enter here plus this chat, and uses it only to reply to you.
        </p>
        {error ? <p role="alert" className="text-[0.85rem]">{error}</p> : null}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={sending || !data.name.trim()}
            className="bg-[var(--accent-blue)] rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {sending ? 'Sending…' : 'Send to Jamey'}
          </button>
          <button type="button" onClick={onDismiss} disabled={sending} className="btn-glass btn-glass--sm text-[var(--text-muted)]">
            No thanks
          </button>
        </div>
      </form>
    </li>
  );
}
