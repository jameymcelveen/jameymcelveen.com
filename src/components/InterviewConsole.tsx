'use client';

import {
  type ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp } from 'lucide-react';
import { readAnalyticsIds, postInsightEvent } from '@/lib/site-analytics';

type ChatRole = 'user' | 'assistant';

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
  streaming?: boolean;
  streamChunks?: string[];
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

const PAGE_QUICK_STARTS = [
  'Walk me through your career',
  'Tell me about your HIPAA experience',
  'What are you currently building?',
  'How do you use AI in your workflow?',
] as const;

function isShortAssistantReply(text: string): boolean {
  const lineCount = text.trim().split(/\n/).filter(Boolean).length;
  return text.length < 360 && lineCount <= 3;
}

export interface InterviewConsoleProps {
  /** When true (e.g. /ai with a page header), fill parent height; composer docks in-flow. */
  fillContainer?: boolean;
}

export function InterviewConsole({ fillContainer = false }: InterviewConsoleProps) {
  const pathname = usePathname();
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const bubbleElRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const streamingScrollDoneForId = useRef<string | null>(null);
  const wasStreamingRef = useRef(false);
  const userScrolledUpRef = useRef(false);
  const panelOpenedAtRef = useRef(0);

  useEffect(() => {
    panelOpenedAtRef.current = Date.now();
  }, []);

  const handleListScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    userScrolledUpRef.current = !nearBottom;
  }, []);

  useEffect(() => {
    if (lines.length < 1) return;
    const last = lines[lines.length - 1];
    if (last.role !== 'user') return;
    const el = bubbleElRef.current.get(last.id);
    requestAnimationFrame(() => {
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [lines]);

  useEffect(() => {
    const streaming = lines.find((l) => l.streaming && l.role === 'assistant');
    if (!streaming) return;
    if (streamingScrollDoneForId.current === streaming.id) return;
    streamingScrollDoneForId.current = streaming.id;
    const el = bubbleElRef.current.get(streaming.id);
    requestAnimationFrame(() => {
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [lines]);

  useEffect(() => {
    const streaming = lines.some((l) => l.streaming);
    if (wasStreamingRef.current && !streaming) {
      const last = lines[lines.length - 1];
      if (
        last?.role === 'assistant' &&
        last.text &&
        isShortAssistantReply(last.text) &&
        !userScrolledUpRef.current
      ) {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
    wasStreamingRef.current = streaming;
  }, [lines]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || busy) return;

      const chatDurationSec = Math.round((Date.now() - panelOpenedAtRef.current) / 1000);
      const path = pathname || '/';
      const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
      postInsightEvent({
        event: 'ask_jamey_question',
        page: path,
        question: message,
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        device,
        chat_duration_sec: chatDurationSec,
      });

      setBusy(true);
      const userLine: ChatLine = { id: crypto.randomUUID(), role: 'user', text: message };
      setLines((prev) => [...prev, userLine]);
      const assistantId = crypto.randomUUID();

      try {
        const ids = readAnalyticsIds();
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            ...(ids.visitorKey ? { visitorKey: ids.visitorKey } : {}),
            ...(ids.sessionId ? { sessionId: ids.sessionId } : {}),
          }),
        });

        if (!res.ok) {
          const data: unknown = await res.json().catch(() => ({}));
          const errMsg =
            typeof data === 'object' && data !== null && 'error' in data
              ? String((data as { error: unknown }).error)
              : `Request failed (${res.status}).`;
          setLines((prev) => [...prev, { id: assistantId, role: 'assistant', text: errMsg, streaming: false }]);
          return;
        }

        setLines((prev) => [...prev, { id: assistantId, role: 'assistant', text: '', streaming: true, streamChunks: [] }]);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() ?? '';
          for (const msg of messages) {
            for (const line of msg.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6);
              if (payload === '[DONE]') {
                setLines((prev) =>
                  prev.map((l) =>
                    l.id === assistantId ? { ...l, streaming: false, streamChunks: undefined } : l
                  )
                );
                break outer;
              }
              try {
                const parsed = JSON.parse(payload) as { delta?: string; error?: string };
                if (parsed.delta) {
                  const piece = parsed.delta;
                  accumulated += piece;
                  setLines((prev) =>
                    prev.map((l) =>
                      l.id === assistantId
                        ? {
                            ...l,
                            text: accumulated,
                            streamChunks: [...(l.streamChunks ?? []), piece],
                          }
                        : l
                    )
                  );
                } else if (parsed.error) {
                  setLines((prev) =>
                    prev.map((l) =>
                      l.id === assistantId
                        ? { ...l, text: parsed.error!, streaming: false, streamChunks: undefined }
                        : l
                    )
                  );
                  break outer;
                }
              } catch {
                /* ignore */
              }
            }
          }
        }

        setLines((prev) =>
          prev.map((l) =>
            l.id === assistantId && l.streaming
              ? {
                  ...l,
                  text: l.text || 'No response received.',
                  streaming: false,
                  streamChunks: undefined,
                }
              : l
          )
        );
      } catch {
        setLines((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            text: 'Network error. Check your connection and try again.',
            streaming: false,
          },
        ]);
      } finally {
        setBusy(false);
        setInput('');
      }
    },
    [busy, pathname]
  );

  const newChat = useCallback(() => {
    streamingScrollDoneForId.current = null;
    wasStreamingRef.current = false;
    userScrolledUpRef.current = false;
    bubbleElRef.current.clear();
    panelOpenedAtRef.current = Date.now();
    setLines([]);
    setInput('');
  }, []);

  const hasInput = input.trim().length > 0;
  const isStreaming = lines.some((l) => l.streaming);
  const disableComposer = busy || isStreaming;
  const waitingFirstToken = lines.some(
    (l) =>
      l.streaming &&
      !(l.text?.length) &&
      !(l.streamChunks && l.streamChunks.length > 0)
  );

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
        <p className="mb-3 last:mb-0 leading-[1.65] text-[var(--ai-assistant)]">{children}</p>
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

  return (
    <div
      className={
        fillContainer
          ? 'ai-chat-shell flex min-h-0 flex-1 flex-col bg-[var(--ai-page-bg)] text-[16px] text-[var(--ai-text)]'
          : 'ai-chat-shell flex min-h-dvh flex-col bg-[var(--ai-page-bg)] text-[16px] text-[var(--ai-text)]'
      }
      data-ai-theme="light"
      suppressHydrationWarning
    >
      <header className="flex h-12 shrink-0 items-center border-b border-[var(--ai-border)] px-4 sm:px-5">
        <div className="flex w-full max-w-[720px] items-center justify-between gap-3 mx-auto">
          <span className="text-sm font-semibold tracking-tight text-[var(--ai-text)]">Ask Jamey</span>
          <button
            type="button"
            onClick={newChat}
            className="text-[var(--ai-text-muted)] hover:text-[var(--ai-text)] text-xs font-medium tracking-wide"
          >
            Clear conversation
          </button>
        </div>
      </header>

      <div ref={listRef} onScroll={handleListScroll} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={`mx-auto max-w-[720px] px-4 sm:px-5 ${fillContainer ? 'pb-3 pt-6' : 'pb-36 pt-6'}`}>
          {lines.length === 0 ? (
            <div className={`flex flex-col items-center justify-center px-2 text-center ${fillContainer ? 'min-h-[38vh]' : 'min-h-[45vh]'}`}>
              <p className="text-[var(--ai-text-muted)] mb-2 max-w-md text-[15px] leading-[1.65]">
                Hi there — I&apos;m an AI trained on Jamey McElveen&apos;s professional background. Ask me anything
                about his experience, projects, or technical approach.
              </p>
              <div className="mt-6 flex w-full max-w-md flex-col gap-2">
                {PAGE_QUICK_STARTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      const path = pathname || '/';
                      const device =
                        typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
                      postInsightEvent({
                        event: 'chip_click',
                        page: path,
                        chip_label: q,
                        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
                        device,
                      });
                      void send(q);
                    }}
                    disabled={disableComposer}
                    className="ask-jamey-chip text-left text-[0.9rem] disabled:opacity-40"
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
                  className={`ai-chat-msg-enter max-w-none ${line.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                >
                  {line.role === 'user' ? (
                    <div
                      ref={(el) => {
                        if (el) bubbleElRef.current.set(line.id, el);
                        else bubbleElRef.current.delete(line.id);
                      }}
                      className="ask-jamey-msg-user max-w-[85%] px-[18px] py-[14px] text-[0.95rem] leading-[1.65]"
                    >
                      {line.text}
                    </div>
                  ) : line.streaming ? (
                    <div
                      ref={(el) => {
                        if (el) bubbleElRef.current.set(line.id, el);
                        else bubbleElRef.current.delete(line.id);
                      }}
                      className="ask-jamey-msg-assistant max-w-[90%] px-[18px] py-[14px] text-[0.95rem] leading-[1.65]"
                    >
                      {line.streamChunks && line.streamChunks.length > 0 ? (
                        <>
                          {line.streamChunks.map((chunk, i) => (
                            <span key={i} className="streaming-text text-[var(--ai-assistant)]">
                              {chunk}
                            </span>
                          ))}
                          <span className="streaming-cursor" aria-hidden />
                        </>
                      ) : line.text ? (
                        <>
                          <span className="streaming-text whitespace-pre-wrap text-[var(--ai-assistant)]">
                            {line.text}
                          </span>
                          <span className="streaming-cursor" aria-hidden />
                        </>
                      ) : (
                        <span className="inline-flex gap-1">
                          <span className="ask-jamey-dot bg-[var(--ai-assistant)]/70 h-1.5 w-1.5 rounded-full" />
                          <span className="ask-jamey-dot bg-[var(--ai-assistant)]/70 h-1.5 w-1.5 rounded-full [animation-delay:0.15s]" />
                          <span className="ask-jamey-dot bg-[var(--ai-assistant)]/70 h-1.5 w-1.5 rounded-full [animation-delay:0.3s]" />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="ask-jamey-msg-assistant ai-md prose-chat max-w-[90%] px-[18px] py-[14px] leading-[1.65] text-[var(--ai-assistant)]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {line.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div ref={endRef} className="h-px w-full shrink-0 scroll-mt-4" aria-hidden />

          <p className="text-[var(--ai-text-muted)] mt-12 text-center text-[11px] leading-relaxed">
            <a href="https://jameymcelveen.com" className="underline-offset-2 hover:underline" rel="author">
              Jamey McElveen
            </a>
            {' · '}
            AI-generated from curated context — not guarantees.
          </p>
        </div>
      </div>

      <div
        className={
          fillContainer
            ? 'shrink-0 border-t border-[var(--ai-border)] bg-[var(--ai-bar-elevated)] px-3 pt-3 pb-3 backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--ai-page-bg)_90%,transparent)]'
            : 'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ai-border)] bg-[var(--ai-bar-elevated)] px-4 pt-3 pb-4 backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--ai-page-bg)_88%,transparent)]'
        }
      >
        <div className="mx-auto max-w-[720px]">
          <form
            className="ai-chat-composer flex items-end gap-2 rounded-xl px-3 py-2"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <label htmlFor="interview-cmd-fill" className="sr-only">
              Message
            </label>
            <textarea
              ref={textareaRef}
              id="interview-cmd-fill"
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
              placeholder="Ask a question…"
              disabled={disableComposer}
              className="min-h-[44px] min-w-0 flex-1 resize-none bg-transparent py-2.5 text-[0.95rem] leading-normal text-[var(--ai-text)] outline-none placeholder:text-[var(--ai-text-muted)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={disableComposer || !input.trim()}
              className="ask-jamey-send mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)] text-white disabled:opacity-35"
              aria-label="Send"
            >
              <ArrowUp
                className={`h-5 w-5 ${waitingFirstToken ? 'opacity-40' : ''}`}
                strokeWidth={2.25}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
