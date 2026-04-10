'use client';

import { type ReactNode, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, MessageSquarePlus, Moon, Paperclip, Sun, Wrench } from 'lucide-react';
import { readAnalyticsIds } from '@/lib/site-analytics';

type ChatRole = 'user' | 'assistant';

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
  streaming?: boolean;
}

function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function walkText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(walkText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const ch = node.props.children;
    if (ch != null) return walkText(ch);
  }
  return '';
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const text = useMemo(() => walkText(children).replace(/\n$/, ''), [children]);
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative my-4">
      <button
        type="button"
        className="absolute top-2 right-2 z-10 rounded-md px-2 py-1 text-[11px] font-medium text-[var(--ai-text-muted)] opacity-0 transition-none group-hover:opacity-100 hover:bg-[var(--ai-user-pill)] hover:text-[var(--ai-text)]"
        onClick={() => {
          void navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-[var(--ai-pre-bg)] px-4 py-3 font-mono text-[13px] leading-relaxed text-[var(--ai-pre-fg)]">
        {children}
      </pre>
    </div>
  );
}

const QUICK_STARTS = [
  'How do you handle SVN to Git migrations?',
  'Tell me about your HIPAA experience at McLeod.',
  'How do you increase team velocity by 30%?',
] as const;

function readInitialAiTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('jm_ai_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function useAiTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(readInitialAiTheme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (localStorage.getItem('jm_ai_theme')) return;
      setTheme(mq.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('jm_ai_theme', next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}

export function InterviewConsole() {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme, toggleTheme } = useAiTheme();

  const base = apiBaseUrl();

  useEffect(() => {
    if (!base) {
      setBanner('Set NEXT_PUBLIC_API_URL or open on the deployed site for same-origin /api.');
    }
  }, [base]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    scrollToBottom(lines.some((l) => l.streaming) ? 'auto' : 'smooth');
  }, [lines, scrollToBottom]);

  const streamAssistant = useCallback((lineId: string, fullText: string) => {
    let pos = 0;
    const tick = () => {
      pos += Math.max(1, Math.min(3, Math.ceil((fullText.length - pos) / 10)));
      if (pos > fullText.length) pos = fullText.length;
      const done = pos >= fullText.length;
      setLines((prev) =>
        prev.map((l) =>
          l.id === lineId ? { ...l, text: fullText.slice(0, pos), streaming: !done } : l
        )
      );
      if (!done) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

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

      const assistantId = crypto.randomUUID();

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
            { id: assistantId, role: 'assistant', text: body, streaming: false },
          ]);
          return;
        }

        const finalText = reply ?? 'No response text returned.';
        setLines((prev) => [...prev, { id: assistantId, role: 'assistant', text: '', streaming: true }]);
        streamAssistant(assistantId, finalText);
      } catch {
        setLines((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            text: 'Network error. Check /api proxy, NEXT_PUBLIC_API_URL, and that the API is running.',
            streaming: false,
          },
        ]);
      } finally {
        setBusy(false);
        setInput('');
      }
    },
    [base, busy, streamAssistant]
  );

  const newChat = useCallback(() => {
    setLines([]);
    setInput('');
    setBanner(null);
  }, []);

  const hasInput = input.trim().length > 0;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [input]);

  const mdComponents = useMemo(
    () => ({
      strong: ({ children }: { children?: ReactNode }) => (
        <strong className="font-semibold text-[var(--ai-assistant)]">{children}</strong>
      ),
      em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
      h1: ({ children }: { children?: ReactNode }) => (
        <h1 className="mt-4 mb-2 text-lg font-semibold text-[var(--ai-assistant)] first:mt-0">{children}</h1>
      ),
      h2: ({ children }: { children?: ReactNode }) => (
        <h2 className="mt-4 mb-2 text-base font-semibold text-[var(--ai-assistant)] first:mt-0">{children}</h2>
      ),
      h3: ({ children }: { children?: ReactNode }) => (
        <h3 className="mt-3 mb-1 text-[15px] font-semibold text-[var(--ai-assistant)]">{children}</h3>
      ),
      p: ({ children }: { children?: ReactNode }) => (
        <p className="mb-3 last:mb-0 leading-[1.7] text-[var(--ai-assistant)]">{children}</p>
      ),
      ul: ({ children }: { children?: ReactNode }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 text-[var(--ai-assistant)]">{children}</ul>
      ),
      ol: ({ children }: { children?: ReactNode }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-[var(--ai-assistant)]">{children}</ol>
      ),
      li: ({ children }: { children?: ReactNode }) => <li className="[&>p]:mb-0">{children}</li>,
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="my-3 border-l-2 border-[var(--ai-blockquote-border)] pl-4 text-[var(--ai-text-muted)]">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-6 border-0 border-t border-[var(--ai-border)]" />,
      a: ({ href, children }: { href?: string; children?: ReactNode }) =>
        href ? (
          <a
            href={href}
            className="text-[var(--ai-assistant)] underline underline-offset-2 opacity-90 hover:opacity-100"
            target="_blank"
            rel="noreferrer noopener"
          >
            {children}
          </a>
        ) : (
          <span className="text-[var(--ai-assistant)]">{children}</span>
        ),
      table: ({ children }: { children?: ReactNode }) => (
        <div className="my-4 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-[14px]">{children}</table>
        </div>
      ),
      thead: ({ children }: { children?: ReactNode }) => <thead>{children}</thead>,
      tbody: ({ children }: { children?: ReactNode }) => (
        <tbody className="[&>tr:nth-child(even)]:bg-[var(--ai-table-stripe)]">{children}</tbody>
      ),
      tr: ({ children }: { children?: ReactNode }) => <tr>{children}</tr>,
      th: ({ children }: { children?: ReactNode }) => (
        <th className="px-3 py-2 text-left align-top font-medium text-[var(--ai-assistant)]">{children}</th>
      ),
      td: ({ children }: { children?: ReactNode }) => (
        <td className="px-3 py-2 align-top leading-snug text-[var(--ai-assistant)]">{children}</td>
      ),
      pre: ({ children }: { children?: ReactNode }) => <CodeBlock>{children}</CodeBlock>,
      code: (props: { className?: string; children?: ReactNode }) => {
        const { className, children, ...rest } = props;
        const block = className?.includes('language-');
        if (block) {
          return (
            <code className={className} {...rest}>
              {children}
            </code>
          );
        }
        return (
          <code
            className="rounded-md bg-[var(--ai-code-bg)] px-1.5 py-0.5 font-mono text-[0.9em] text-[var(--ai-assistant)]"
            {...rest}
          >
            {children}
          </code>
        );
      },
    }),
    []
  );

  const isStreaming = lines.some((l) => l.streaming);
  const disableComposer = busy || isStreaming || !base;

  return (
    <div
      className="ai-chat-shell flex min-h-dvh flex-col bg-[var(--ai-page-bg)] text-[15px] text-[var(--ai-text)]"
      data-ai-theme={theme}
      suppressHydrationWarning
    >
      <header className="flex h-12 shrink-0 items-center border-b border-[var(--ai-border)] px-4">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between">
          <span className="text-sm font-medium">Interview</span>
          <div className="flex gap-0.5">
            <button
            type="button"
            onClick={newChat}
            className="transition-none rounded-md p-2 text-[var(--ai-icon-muted)] hover:bg-[var(--ai-user-pill)] hover:text-[var(--ai-text)]"
            aria-label="New chat"
          >
            <MessageSquarePlus className="size-5" strokeWidth={1.75} />
          </button>
            <button
            type="button"
            onClick={toggleTheme}
            className="transition-none rounded-md p-2 text-[var(--ai-icon-muted)] hover:bg-[var(--ai-user-pill)] hover:text-[var(--ai-text)]"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="size-5" strokeWidth={1.75} /> : <Moon className="size-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </header>

      {banner && (
        <div
          className="border-b border-[var(--ai-border)] px-4 py-2 text-center text-[13px] text-[var(--ai-text-muted)]"
          role="status"
        >
          {banner}
        </div>
      )}

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-4 pt-6 pb-36">
          {lines.length === 0 ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center px-2 text-center">
              <p className="mb-8 text-[var(--ai-text-muted)]">Ask a professional or technical question.</p>
              <div className="flex max-w-md flex-col gap-2">
                {QUICK_STARTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      void send(q);
                    }}
                    disabled={disableComposer}
                    className="rounded-lg px-3 py-2 text-left text-[14px] text-[var(--ai-text-muted)] hover:bg-[var(--ai-user-pill)] hover:text-[var(--ai-text)] disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className={`ai-chat-msg-enter max-w-none ${line.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  {line.role === 'user' ? (
                    <div className="max-w-[85%] rounded-2xl bg-[var(--ai-user-pill)] px-4 py-2.5 text-[15px] leading-relaxed text-[var(--ai-text)]">
                      {line.text}
                    </div>
                  ) : line.streaming ? (
                    <div className="max-w-none whitespace-pre-wrap leading-[1.7] text-[var(--ai-assistant)]">
                      {line.text}
                    </div>
                  ) : (
                    <div className="ai-md prose-chat max-w-none leading-[1.7] text-[var(--ai-assistant)]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {line.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-12 text-center text-[11px] leading-relaxed text-[var(--ai-text-muted)]">
            <a
              href="https://jameymcelveen.com"
              className="underline-offset-2 hover:underline"
              rel="author"
            >
              Jamey McElveen
            </a>
            {' · '}
            AI-generated from curated context—not live advice or guarantees.
          </p>
        </div>
      </div>

      {/* Pinned composer — no rounded outer page shell; bar is full-bleed width, inner field ~16px radius */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ai-border)] bg-[var(--ai-bar-elevated)] backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--ai-page-bg)_88%,transparent)]">
        <div className="mx-auto max-w-[720px] px-4 pt-3 pb-4">
          <form
            className="ai-chat-composer flex items-end gap-1.5 rounded-2xl bg-[var(--ai-input-bg)] px-2 py-1.5 shadow-sm focus-within:shadow-[var(--ai-focus-shadow)]"
            style={{ border: '1px solid var(--ai-input-border)' }}
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <div className="flex shrink-0 items-center gap-0.5 self-end pb-1.5">
              <button
                type="button"
                disabled
                className={`rounded-full p-2 ${hasInput ? 'bg-[var(--ai-user-pill)] text-[var(--ai-text)]' : 'text-[var(--ai-icon-muted)]'}`}
                aria-label="Attachments (coming soon)"
              >
                <Paperclip className="size-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                disabled
                className={`rounded-full p-2 ${hasInput ? 'bg-[var(--ai-user-pill)] text-[var(--ai-text)]' : 'text-[var(--ai-icon-muted)]'}`}
                aria-label="Tools (coming soon)"
              >
                <Wrench className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <label htmlFor="interview-cmd" className="sr-only">
              Message
            </label>
            <textarea
              ref={textareaRef}
              id="interview-cmd"
              name="message"
              rows={1}
              autoComplete="off"
              spellCheck
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="How can I help you today?"
              disabled={disableComposer}
              className="placeholder:text-center placeholder:text-[var(--ai-text-muted)] min-h-[44px] min-w-0 flex-1 resize-none bg-transparent py-2.5 leading-normal text-[var(--ai-text)] outline-none placeholder:translate-y-[1px] disabled:opacity-50 sm:placeholder:text-left"
            />
            <button
              type="submit"
              disabled={disableComposer || !input.trim()}
              className="mb-1 shrink-0 rounded-full bg-[var(--ai-send-bg)] p-2 text-[var(--ai-send-fg)] disabled:opacity-35"
              aria-label="Send"
            >
              {busy || isStreaming ? (
                <span className="block size-5 text-center text-xs leading-5">…</span>
              ) : (
                <ArrowUp className="size-5" strokeWidth={2.25} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
