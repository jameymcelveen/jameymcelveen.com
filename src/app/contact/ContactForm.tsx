'use client';

import { useState, type FormEvent } from 'react';
import { CONTACT_LIMITS } from '@/lib/contact';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; text: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === 'sending') return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus({
          kind: 'error',
          text: json.error || 'That did not go through. Please email jamey@mcelveen.us.',
        });
        return;
      }
      form.reset();
      setStatus({ kind: 'sent' });
    } catch {
      setStatus({ kind: 'error', text: 'I could not reach the server. Please try again.' });
    }
  };

  if (status.kind === 'sent') {
    return (
      <div className="cf-done" role="status">
        <b>Thanks, it is on its way.</b>
        <span>I will get back to you soon.</span>
        <button type="button" className="cf-link" onClick={() => setStatus({ kind: 'idle' })}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="cf" onSubmit={onSubmit} noValidate>
      <div className="cf-row">
        <label className="cf-field">
          <span>Name</span>
          <input name="name" required maxLength={CONTACT_LIMITS.name} autoComplete="name" />
        </label>
        <label className="cf-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={CONTACT_LIMITS.email}
            autoComplete="email"
          />
        </label>
      </div>
      <label className="cf-field">
        <span>
          Company or role <em>(optional)</em>
        </span>
        <input name="company" maxLength={CONTACT_LIMITS.company} autoComplete="organization" />
      </label>
      <label className="cf-field">
        <span>Message</span>
        <textarea name="message" required rows={7} maxLength={CONTACT_LIMITS.message} />
      </label>
      {/* Honeypot: hidden from people, bots fill it in. */}
      <label className="cf-hp" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {status.kind === 'error' ? (
        <p className="cf-error" role="alert">
          {status.text}
        </p>
      ) : null}
      <div className="cf-actions">
        <button type="submit" className="cf-send" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending...' : 'Send message'}
        </button>
        <span className="cf-alt">
          Or email <span className="cf-addr">jamey@mcelveen.us</span>
        </span>
      </div>
    </form>
  );
}
