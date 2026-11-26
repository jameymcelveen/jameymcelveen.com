'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react';
import {
  insightsHeaders,
  readInsightsKey,
  saveInsightsKey,
  subscribeInsightsKey,
} from '@/lib/insights-key';

type Message = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string;
  message: string;
  emailed: boolean;
};

const when = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
});

async function fetchMessages(
  password: string
): Promise<'unauthorized' | { connected: boolean; items: Message[] }> {
  try {
    const res = await fetch('/api/admin/messages', {
      cache: 'no-store',
      headers: insightsHeaders(password),
    });
    if (res.status === 401) return 'unauthorized';
    return (await res.json()) as { connected: boolean; items: Message[] };
  } catch {
    return { connected: false, items: [] };
  }
}

export function AdminHome() {
  // null on the server; the stored password (or '') once in the browser.
  const key = useSyncExternalStore<string | null>(
    subscribeInsightsKey,
    readInsightsKey,
    () => null
  );
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchMessages(key).then((result) => {
      if (cancelled) return;
      if (result === 'unauthorized') {
        saveInsightsKey('');
        setError('That password did not work.');
        return;
      }
      setConnected(result.connected);
      setMessages(result.items);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (key === null) return null;

  if (!key) {
    return (
      <SignIn
        error={error}
        onSubmit={(password) => {
          setError('');
          saveInsightsKey(password);
        }}
      />
    );
  }

  return (
    <div>
      <div className="bl-head ad-head">
        <div>
          <div className="bl-meta">Admin</div>
          <h1>Admin</h1>
        </div>
        <button type="button" className="cf-link" onClick={() => saveInsightsKey('')}>
          Sign out
        </button>
      </div>

      <nav className="ad-links" aria-label="Admin pages">
        <Link className="ad-link" href="/dashboard">
          <b>Site Insights</b>
          <span>Visits, Ask Jamey questions, traffic sources</span>
        </Link>
        <Link className="ad-link" href="/lab/board">
          <b>Lab: job board</b>
          <span>Scanned postings and fit checks</span>
        </Link>
        <Link className="ad-link" href="/cover-letters">
          <b>Cover letters</b>
          <span>Templates (asks for the PIN)</span>
        </Link>
      </nav>

      <h2 className="ad-h2">Contact messages</h2>
      {!connected ? (
        <p className="ad-empty">The database is not reachable right now.</p>
      ) : messages === null ? (
        <p className="ad-empty">Loading...</p>
      ) : messages.length === 0 ? (
        <p className="ad-empty">No messages yet.</p>
      ) : (
        <ul className="ad-msgs">
          {messages.map((m) => (
            <li key={m.id} className="ad-msg">
              <div className="ad-msg-top">
                <b>{m.name}</b>
                {m.company ? <span className="ad-co">{m.company}</span> : null}
                <span className="ad-when">{when.format(new Date(m.created_at))}</span>
              </div>
              <a className="ad-mail" href={`mailto:${m.email}`}>
                {m.email}
              </a>
              <p className="ad-body">{m.message}</p>
              {!m.emailed ? <span className="ad-tag">Not emailed</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SignIn({ error, onSubmit }: { error: string; onSubmit: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = password.trim();
    if (value) onSubmit(value);
  };
  return (
    <form className="cf ad-signin" onSubmit={submit}>
      <div className="bl-meta">Admin</div>
      <h1 className="ad-title">Sign in</h1>
      <label className="cf-field">
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
      </label>
      {error ? (
        <p className="cf-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="cf-actions">
        <button type="submit" className="cf-send">
          Sign in
        </button>
      </div>
    </form>
  );
}
