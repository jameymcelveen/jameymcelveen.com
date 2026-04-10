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
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
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
      setBanner('Set NEXT_PUBLIC_API_URL or load this app in the browser (same-origin /api).');
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
            text: 'Network error. Check Vercel /api proxy (INTERVIEW_API_PROXY_ORIGIN), NEXT_PUBLIC_API_URL, and that the API is running.',
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
    <div className="flex min-h-[calc(100vh-7rem)] flex-col pb-36">
      <header className="mx-auto mb-8 w-full max-w-2xl text-center">
        <p className="text-accent mb-2 font-mono text-[10px] tracking-[0.2em] uppercase">
          Architect interview
        </p>
        <h1 className="text-foreground font-mono text-xl font-semibold tracking-tight sm:text-2xl">
          Career &amp; technical Q&amp;A
        </h1>
        <p className="text-foreground-muted mx-auto mt-3 max-w-lg text-sm leading-relaxed">
          Grounded in public resume context: .NET modernization, HIPAA-aware delivery, legacy refactors.
        </p>
      </header>

      {banner && (
        <div
          className="border-steel bg-surface text-foreground-muted mx-auto mb-4 w-full max-w-2xl rounded-md border px-3 py-2 font-mono text-xs sm:text-sm"
          role="status"
        >
          {banner}
        </div>
      )}

      <div
        ref={listRef}
        className="border-steel bg-background/40 mx-auto mb-4 w-full max-w-2xl flex-1 overflow-y-auto rounded-md border px-1 sm:px-2"
        style={{ maxHeight: 'min(52vh, 28rem)' }}
      >
        {lines.length === 0 ? (
          <p className="text-foreground-muted p-4 text-center text-sm italic">
            No messages yet. Use quick prompts below or the command bar.
          </p>
        ) : (
          <ul className="flex flex-col gap-5 py-4">
            {lines.map((line) => (
              <li
                key={line.id}
                className={
                  line.role === 'user'
                    ? 'border-accent bg-surface/50 border-l-2 py-3 pr-3 pl-4'
                    : 'border-accent-csharp border-l-2 py-3 pr-3 pl-4'
                }
              >
                <div className="text-foreground-muted mb-1.5 font-mono text-[10px] tracking-widest uppercase">
                  {line.role === 'user' ? 'You' : 'Response'}
                </div>
                {line.role === 'user' ? (
                  <p className="text-foreground text-sm leading-relaxed">{line.text}</p>
                ) : (
                  <div className="prose-cmd interview-md text-foreground-muted text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        strong: (props) => (
                          <strong className="text-foreground font-semibold">{props.children}</strong>
                        ),
                        h2: (props) => (
                          <h2 className="text-foreground border-steel mt-4 mb-2 border-b pb-1 font-mono text-base font-semibold tracking-tight first:mt-0">
                            {props.children}
                          </h2>
                        ),
                        h3: (props) => (
                          <h3 className="text-foreground mt-3 mb-1 font-mono text-sm font-semibold">
                            {props.children}
                          </h3>
                        ),
                        p: (props) => <p className="mb-2 last:mb-0">{props.children}</p>,
                        ul: (props) => (
                          <ul className="mb-2 list-disc space-y-1 pl-5 marker:text-accent-csharp">{props.children}</ul>
                        ),
                        ol: (props) => (
                          <ol className="mb-2 list-decimal space-y-1 pl-5">{props.children}</ol>
                        ),
                        li: (props) => <li className="[&>p]:mb-0">{props.children}</li>,
                        em: (props) => <em className="text-foreground/90 not-italic">{props.children}</em>,
                        code: (props) => {
                          const { className, children, ...rest } = props;
                          const inline = !className?.includes('language-');
                          return inline ? (
                            <code {...rest} className="font-mono text-[0.9em]">
                              {children}
                            </code>
                          ) : (
                            <code {...rest} className={className}>
                              {children}
                            </code>
                          );
                        },
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

      <div className="mx-auto mb-24 flex w-full max-w-2xl flex-wrap gap-2">
        {QUICK_STARTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              void send(q);
            }}
            disabled={busy || !base}
            className="border-steel bg-surface text-foreground-muted hover:border-accent/50 hover:text-foreground rounded-md border px-3 py-1.5 text-left font-mono text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Glass floating input */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:px-6 sm:pb-5">
        <form
          className="border-steel bg-surface/75 pointer-events-auto flex w-full max-w-2xl items-end gap-2 rounded-xl border shadow-[0_-8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <label htmlFor="interview-cmd" className="sr-only">
            Interview question
          </label>
          <div className="flex min-h-[3.25rem] flex-1 items-center gap-2 px-3 py-2 sm:px-4">
            <span className="text-accent font-mono text-sm select-none" aria-hidden>
              &gt;
            </span>
            <input
              id="interview-cmd"
              name="message"
              autoComplete="off"
              spellCheck
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                base ? 'Ask a professional or technical question…' : 'Configure API URL or open in browser for same-origin /api…'
              }
              disabled={busy || !base}
              className="text-foreground placeholder:text-foreground-muted/60 min-w-0 flex-1 border-0 bg-transparent py-1 font-mono text-sm outline-none disabled:opacity-50 sm:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !input.trim() || !base}
            className="bg-accent text-background m-2 shrink-0 rounded-md px-4 py-2 font-mono text-xs font-medium hover:brightness-110 disabled:opacity-40 sm:text-sm"
          >
            {busy ? '…' : 'Send'}
          </button>
        </form>
      </div>

      <footer className="text-foreground-muted mx-auto mt-auto max-w-2xl px-2 text-center text-[10px] sm:text-xs">
        <a href="https://jameymcelveen.com" className="text-accent hover:text-accent-csharp transition-colors" rel="author">
          Jamey McElveen
        </a>
        <span className="text-foreground-muted/50"> · </span>
        <span>AI-generated from curated context—not live advice or guarantees.</span>
      </footer>
    </div>
  );
}
