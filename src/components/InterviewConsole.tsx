'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { readAnalyticsIds } from '@/lib/site-analytics';

type ChatRole = 'user' | 'assistant';

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
}

function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw?.trim()) return '';
  return raw.replace(/\/+$/, '');
}

const QUICK_STARTS = [
  'How do you handle SVN to Git migrations?',
  'Tell me about your HIPAA experience at McLeod.',
  'How do you increase team velocity by 30%?',
] as const;

export function InterviewConsole() {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const base = apiBaseUrl();

  useEffect(() => {
    if (!base) {
      setBanner('Set NEXT_PUBLIC_API_URL to your Interview API origin (e.g. https://your-api.up.railway.app).');
    }
  }, [base]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || busy) return;
      if (!base) return;

      setBanner(null);
      setBusy(true);
      const userLine: ChatLine = {
        id: crypto.randomUUID(),
        role: 'user',
        text: message,
      };
      setLines((prev) => [...prev, userLine]);

      try {
        const ids = readAnalyticsIds();
        const res = await fetch(`${base}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            ...(ids.visitorKey ? { visitorKey: ids.visitorKey } : {}),
            ...(ids.sessionId ? { sessionId: ids.sessionId } : {}),
          }),
        });

        const data: unknown = await res.json().catch(() => ({}));
        const reply =
          typeof data === 'object' &&
          data !== null &&
          'reply' in data &&
          typeof (data as { reply: unknown }).reply === 'string'
            ? (data as { reply: string }).reply
            : null;
        const errMsg =
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : null;
        const errDetail =
          typeof data === 'object' &&
          data !== null &&
          'detail' in data &&
          typeof (data as { detail: unknown }).detail === 'string'
            ? (data as { detail: string }).detail
            : null;

        if (!res.ok) {
          const body = [errMsg ?? `Request failed (${res.status}).`, errDetail && `(${errDetail})`]
            .filter(Boolean)
            .join('\n\n');
          setLines((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              text: body,
            },
          ]);
          return;
        }

        setLines((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: reply ?? 'No response text returned.',
          },
        ]);
      } catch {
        setLines((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: 'Network error. Check NEXT_PUBLIC_API_URL and that the API is running.',
          },
        ]);
      } finally {
        setBusy(false);
        setInput('');
      }
    },
    [base, busy]
  );

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col px-4 pb-16 pt-24 sm:px-6">
      <header className="mb-8 text-center">
        <p className="text-accent mb-2 font-mono text-xs tracking-[0.2em] uppercase">
          AI Interview · Architecture &amp; Compliance
        </p>
        <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          <span className="glass-card text-accent-highlight border-accent/25 inline-block border px-2 py-0.5">
            &gt;_ interview-console
          </span>
        </h1>
        <p className="text-foreground-muted mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
          Ask career and technical questions—.NET modernization, HIPAA-aware delivery, legacy refactors—grounded in
          public resume context.
        </p>
      </header>

      {banner && (
        <div
          className="glass-card border-accent/30 text-foreground-muted mb-4 rounded-lg border px-3 py-2 font-mono text-xs sm:text-sm"
          role="status"
        >
          {banner}
        </div>
      )}

      <div
        ref={listRef}
        className="glass-card border-glass-border mb-4 max-h-[38vh] min-h-[120px] overflow-y-auto rounded-xl border font-mono text-sm leading-relaxed shadow-inner sm:text-base"
      >
        {lines.length === 0 ? (
          <div className="text-foreground-muted p-4 text-sm italic">
            No messages yet. Type a question or use a quick-start below.
          </div>
        ) : (
          <ul className="flex flex-col gap-4 p-4">
            {lines.map((line) => (
              <li key={line.id} className="text-foreground leading-relaxed">
                <span className="text-accent">
                  {line.role === 'user' ? 'guest@interview' : 'jamey-agent'}
                </span>
                <span className="text-foreground-muted">:</span>{' '}
                {line.role === 'user' ? (
                  <span className="text-foreground">{line.text}</span>
                ) : (
                  <div className="interview-md text-foreground-muted mt-1 inline-block max-w-none">
                    <ReactMarkdown
                      components={{
                        strong: (props) => (
                          <strong className="text-accent-highlight font-semibold text-foreground">{props.children}</strong>
                        ),
                        h2: (props) => (
                          <h2 className="text-foreground mt-3 mb-2 border-b border-glass-border pb-1 text-base font-semibold first:mt-0">
                            {props.children}
                          </h2>
                        ),
                        h3: (props) => (
                          <h3 className="text-foreground mt-2 mb-1 text-sm font-semibold">{props.children}</h3>
                        ),
                        p: (props) => <p className="mb-2 last:mb-0">{props.children}</p>,
                        ul: (props) => <ul className="mb-2 list-disc space-y-1 pl-5">{props.children}</ul>,
                        ol: (props) => <ol className="mb-2 list-decimal space-y-1 pl-5">{props.children}</ol>,
                        li: (props) => <li className="[&>p]:mb-0">{props.children}</li>,
                        em: (props) => <em className="text-foreground/90">{props.children}</em>,
                      }}
                    >
                      {line.text}
                    </ReactMarkdown>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_STARTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              void send(q);
            }}
            disabled={busy || !base}
            className="glass-card border-accent/35 text-foreground hover:border-accent/60 rounded-lg border px-3 py-1.5 text-left font-mono text-xs transition-colors hover:bg-accent-glow disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        className="glass-card border-accent/40 relative rounded-xl border-2 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor="interview-cmd" className="sr-only">
          Interview question
        </label>
        <div className="flex items-stretch gap-0">
          <span className="text-accent flex select-none items-center pl-3 font-mono text-sm sm:text-base" aria-hidden>
            $
          </span>
          <input
            id="interview-cmd"
            name="message"
            autoComplete="off"
            spellCheck
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              base ? 'Ask a professional or technical question…' : 'Configure NEXT_PUBLIC_API_URL to enable sending…'
            }
            disabled={busy || !base}
            className="text-foreground placeholder:text-foreground-muted/50 min-w-0 flex-1 border-0 bg-transparent py-3 pr-20 pl-1 font-mono text-sm outline-none disabled:opacity-50 sm:text-base"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !input.trim() || !base}
          className="glow bg-accent absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-3 py-1.5 font-mono text-xs font-medium text-white transition-opacity disabled:opacity-40 sm:text-sm"
        >
          {busy ? '…' : 'Enter'}
        </button>
      </form>

      <footer className="text-foreground-muted mt-8 text-center text-xs sm:mt-10 sm:text-sm">
        <a href="https://jameymcelveen.com" className="text-accent hover:text-accent-highlight transition-colors" rel="author">
          Powered by Jamey McElveen
        </a>
        <span className="text-foreground-muted/40"> · </span>
        <span>AI-generated from curated context—not live advice or guarantees.</span>
      </footer>
    </section>
  );
}
