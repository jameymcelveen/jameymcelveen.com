'use client';

import Image from 'next/image';
import { type ReactNode, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, X } from 'lucide-react';
import { readAnalyticsIds, postInsightEvent } from '@/lib/site-analytics';

const ASK_JAMEY_AVATAR = '/images/ask-jamey.webp';

type ChatRole = 'user' | 'assistant';

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
  streaming?: boolean;
  isWelcome?: boolean;
  streamChunks?: string[];
}

const WELCOME_LINE_ID = 'ask-jamey-welcome';
const OPENING_MESSAGE =
  "Hi there — I'm an AI trained on Jamey McElveen's professional background.\nAsk me anything about his experience, projects, or technical approach.";

const STARTER_CHIPS = [
  'Walk me through your career',
  'Tell me about your HIPAA experience',
  'What are you currently building?',
  'How do you use AI in your workflow?',
] as const;

function isShortAssistantReply(text: string): boolean {
  const lineCount = text.trim().split(/\n/).filter(Boolean).length;
  return text.length < 360 && lineCount <= 3;
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
    <div className="group relative my-3">
      <button
        type="button"
        className="absolute top-2 right-2 z-10 rounded-md px-2 py-1 text-[11px] font-medium text-[var(--text-muted)] opacity-0 transition-none group-hover:opacity-100 hover:bg-[var(--glass-hover-bg)] hover:text-[var(--ask-jamey-fg)]"
        onClick={() => {
          void navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto rounded-xl bg-black/35 px-4 py-3 font-mono text-[13px] leading-relaxed text-[var(--ask-jamey-fg)]">
        {children}
      </pre>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 px-1" aria-hidden>
      <span className="ask-jamey-dot bg-[var(--ask-jamey-fg)]/70 h-1.5 w-1.5 rounded-full" />
      <span className="ask-jamey-dot bg-[var(--ask-jamey-fg)]/70 h-1.5 w-1.5 rounded-full [animation-delay:0.15s]" />
      <span className="ask-jamey-dot bg-[var(--ask-jamey-fg)]/70 h-1.5 w-1.5 rounded-full [animation-delay:0.3s]" />
    </span>
  );
}

export function AskJameyChatPanel({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<ChatLine[]>([
    {
      id: WELCOME_LINE_ID,
      role: 'assistant',
      text: OPENING_MESSAGE,
      streaming: false,
      isWelcome: true,
    },
  ]);
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

  const userMessageCount = useMemo(() => lines.filter((l) => l.role === 'user').length, [lines]);
  const hasAssistantReply = useMemo(
    () =>
      lines.some(
        (l) => l.role === 'assistant' && !l.isWelcome && !l.streaming && (l.text?.length ?? 0) > 0
      ),
    [lines]
  );
  const expanded = userMessageCount >= 1 && hasAssistantReply;

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
    const streaming = lines.find((l) => l.streaming && l.role === 'assistant' && !l.isWelcome);
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
        !last.isWelcome &&
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
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
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
    [busy]
  );

  const resetChat = useCallback(() => {
    streamingScrollDoneForId.current = null;
    wasStreamingRef.current = false;
    userScrolledUpRef.current = false;
    bubbleElRef.current.clear();
    panelOpenedAtRef.current = Date.now();
    setLines([
      {
        id: WELCOME_LINE_ID,
        role: 'assistant',
        text: OPENING_MESSAGE,
        streaming: false,
        isWelcome: true,
      },
    ]);
    setInput('');
  }, []);

  const hasInput = input.trim().length > 0;
  const isStreaming = lines.some((l) => l.streaming);
  const disableComposer = busy || isStreaming;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const mdComponents = useMemo(
    () => ({
      strong: ({ children }: { children?: ReactNode }) => (
        <strong className="font-semibold text-[var(--ask-jamey-fg)]">{children}</strong>
      ),
      em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
      p: ({ children }: { children?: ReactNode }) => (
        <p className="mb-3 last:mb-0 leading-[1.65] text-[var(--ask-jamey-fg)]">{children}</p>
      ),
      ul: ({ children }: { children?: ReactNode }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 text-[var(--ask-jamey-fg)]">{children}</ul>
      ),
      ol: ({ children }: { children?: ReactNode }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-[var(--ask-jamey-fg)]">{children}</ol>
      ),
      li: ({ children }: { children?: ReactNode }) => <li className="[&>p]:mb-0">{children}</li>,
      a: ({ href, children }: { href?: string; children?: ReactNode }) =>
        href ? (
          <a
            href={href}
            className="text-[var(--accent-blue)] underline underline-offset-2 hover:opacity-90"
            target="_blank"
            rel="noreferrer noopener"
          >
            {children}
          </a>
        ) : (
          <span>{children}</span>
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
            className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-[var(--ask-jamey-fg)]"
            {...rest}
          >
            {children}
          </code>
        );
      },
    }),
    []
  );

  const waitingFirstToken = useMemo(
    () =>
      lines.some(
        (l) =>
          l.streaming &&
          !l.isWelcome &&
          !(l.text?.length) &&
          !(l.streamChunks && l.streamChunks.length > 0)
      ),
    [lines]
  );

  return (
    <div
      className={`ask-jamey-panel-host fixed inset-x-0 bottom-0 z-50 flex w-full max-h-[90vh] flex-col sm:inset-x-auto sm:bottom-6 sm:left-auto sm:right-6 sm:w-[480px] ${expanded ? 'h-[min(85dvh,90vh)]' : 'h-[min(70dvh,90vh)]'} transition-[height] duration-300 ease-out`}
      style={{ willChange: 'transform' }}
    >
      <div
        className="ask-jamey-panel-inner flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[20px] sm:rounded-[20px] sm:rounded-b-none"
        style={{
        willChange: 'transform',
        background: 'rgba(15, 20, 35, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-[var(--glass-border)] px-4 py-3">
        <Image
          src={ASK_JAMEY_AVATAR}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full border border-[var(--glass-border)] object-cover"
          sizes="40px"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--ask-jamey-fg)]">Ask Jamey</h2>
          <p className="text-[var(--text-muted)] text-xs leading-snug">AI trained on Jamey&apos;s professional background</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--ask-jamey-fg)] shrink-0 rounded-lg p-2 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </header>

      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="ask-jamey-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <ul className="flex flex-col gap-4">
          {lines.map((line) => (
            <li
              key={line.id}
              className={`flex max-w-full ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
              ) : line.isWelcome ? (
                <div className="ask-jamey-msg-assistant max-w-[90%] whitespace-pre-wrap px-[18px] py-[14px] text-[0.95rem] leading-[1.65]">
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
                        <span key={i} className="streaming-text text-[var(--ask-jamey-fg)]">
                          {chunk}
                        </span>
                      ))}
                      <span className="streaming-cursor" aria-hidden />
                    </>
                  ) : line.text ? (
                    <>
                      <span className="streaming-text whitespace-pre-wrap text-[var(--ask-jamey-fg)]">
                        {line.text}
                      </span>
                      <span className="streaming-cursor" aria-hidden />
                    </>
                  ) : (
                    <LoadingDots />
                  )}
                </div>
              ) : (
                <div className="ask-jamey-msg-assistant ai-md prose-chat max-w-[90%] px-[18px] py-[14px] text-[0.95rem] leading-[1.65]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {line.text}
                  </ReactMarkdown>
                </div>
              )}
            </li>
          ))}
        </ul>

        {userMessageCount === 0 ? (
          <div className="mt-4 flex flex-col gap-2 pb-2">
            {STARTER_CHIPS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={disableComposer}
                onClick={() => {
                  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
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
                className="ask-jamey-chip text-left text-[0.9rem] disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        ) : null}

        <div ref={endRef} className="h-px w-full shrink-0 scroll-mt-4" aria-hidden />

        <p className="text-[var(--text-muted)] mt-6 text-center text-[10px] leading-relaxed">
          AI-generated from curated context — not guarantees.
        </p>
        <button
          type="button"
          onClick={resetChat}
          className="text-[var(--text-muted)] hover:text-[var(--ask-jamey-fg)] mx-auto mt-2 block text-[11px] underline-offset-2 hover:underline"
        >
          Start over
        </button>
      </div>

      <div className="ask-jamey-composer shrink-0 border-t border-[var(--glass-border)] px-3 py-3">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <label htmlFor="ask-jamey-input" className="sr-only">
            Message
          </label>
          <textarea
            ref={textareaRef}
            id="ask-jamey-input"
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
            className="ask-jamey-input text-[var(--ask-jamey-fg)] min-h-[44px] min-w-0 flex-1 resize-none px-4 py-3 text-[0.95rem] leading-normal outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disableComposer || !input.trim()}
            className="ask-jamey-send bg-[var(--accent-blue)] text-white mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-35"
            aria-label="Send"
          >
            {waitingFirstToken ? <LoadingDots /> : <ArrowUp className="h-5 w-5" strokeWidth={2.25} />}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
