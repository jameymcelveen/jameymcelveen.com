'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Ambulance, CreditCard, Moon, Sparkles, Sun, Users } from 'lucide-react';
import { ObfuscatedEmail } from '@/components/ObfuscatedContact';
import { SecretLock } from '@/components/PinGate';
import { useInsightsAvailable } from '@/hooks/useInsightsAvailable';
import { postInsightEvent, readAnalyticsIds } from '@/lib/site-analytics';
import './home-chat.css';

const AVATAR = '/images/ask-jamey.webp';
const PHOTO = '/jamey-mcelveen.jpg';
const THEME_KEY = 'jm:theme';

const OPENING_MESSAGE =
  "Hi, I'm Ask Jamey, an AI version of Jamey built from his real background. Ask me about his experience, leadership, or fit for your role. For anything official, email jamey@mcelveen.us.";

const JD_CHIP = 'Check my job description';
const STARTER_CHIPS = [
  'Walk me through your career',
  'Tell me about your leadership experience',
  'Are you open to remote or contract-to-hire?',
  'What are you building right now?',
  JD_CHIP,
] as const;

const FOLLOW_UPS = [
  'What are you building right now?',
  'Tell me about your leadership experience',
  JD_CHIP,
] as const;

type CaseStudy = {
  title: string;
  problem: string;
  approach: string;
  result: string;
  tags: string[];
};

type BuiltCard = {
  key: string;
  title: string;
  eyebrow: string;
  question: string;
  tile: string;
  tint: string;
  icon: ReactNode;
  study: CaseStudy;
};

/** Titles are verbatim from the resume summary. Case-study text restates facts in background.md. */
const BUILT: BuiltCard[] = [
  {
    key: 'saas',
    title: 'Multi-tenant SaaS for 50,000 organizations',
    eyebrow: 'ACS Technologies',
    question: 'How did tenants migrate with zero downtime?',
    tile: 'var(--green-tile)',
    tint: 'rgba(127,194,120,.2)',
    icon: <Users aria-hidden />,
    study: {
      title: 'Multi-tenant SaaS for 50,000 organizations',
      problem:
        'Nearly 50,000 organizations on one platform, each needing its data kept apart from the rest.',
      approach:
        'Row-level-security multi-tenancy, designed so a tenant could be migrated with zero downtime.',
      result:
        'One platform serving nearly 50,000 organizations, led with a distributed team of 20+ engineers.',
      tags: ['C#', '.NET', 'SQL Server', 'Row-level security', 'Multi-tenant'],
    },
  },
  {
    key: 'payments',
    title: 'Payments API on AWS that stopped live fraud attacks',
    eyebrow: 'SecureGive',
    question: 'How would you prevent payment fraud?',
    tile: 'var(--orange-tile)',
    tint: 'rgba(208,104,58,.2)',
    icon: <CreditCard aria-hidden />,
    study: {
      title: 'Payments API on AWS that stopped live fraud attacks',
      problem: 'Live card-testing attacks against a church giving platform.',
      approach:
        'A public API in C# and .NET Core on AWS (Kubernetes on EKS) behind an Ocelot gateway, with anti-fraud heuristics.',
      result: 'The heuristics shut down the live card-testing attacks.',
      tags: ['C#', '.NET Core', 'AWS EKS', 'Ocelot', 'OpenAPI'],
    },
  },
  {
    key: 'hipaa',
    title: 'HIPAA clinical systems',
    eyebrow: 'McLeod Health · Christ Medical',
    question: 'How did you keep PHI out of test environments?',
    tile: 'var(--blue-tile)',
    tint: 'rgba(156,195,234,.25)',
    icon: <Ambulance aria-hidden />,
    study: {
      title: 'HIPAA clinical systems',
      problem:
        'Developers need realistic data to debug, and real patient data does not belong outside production.',
      approach:
        'Structured logging (ELK) with a PHI-scrubbing service, alongside Epic and Oracle Cloud integration bridges.',
      result:
        'Non-production environments carry synthetic identities instead of real patient data.',
      tags: ['.NET', 'HIPAA', 'Epic', 'ELK', 'PostgreSQL'],
    },
  },
  {
    key: 'ai',
    title: 'Builds with AI every day',
    eyebrow: 'Agent fleet · Ask Jamey · QikLog',
    question: 'How do you use AI, and do you understand what it builds?',
    tile: 'var(--violet-tile)',
    tint: 'rgba(160,130,190,.22)',
    icon: <Sparkles aria-hidden />,
    study: {
      title: 'Builds with AI every day',
      problem: 'AI writes code fast. Someone still has to own what ships.',
      approach:
        'A fleet of role-based Claude agents. I write the spec and the test plan, and the agents work inside those lanes.',
      result:
        'Every change gets my review before it ships. This chat is one of the things built that way.',
      tags: ['Claude Code', 'Agents', 'Spec-first', 'Human review'],
    },
  },
];

type FitResult = {
  ats: { score: number; matched: string[]; missing: string[] };
  gaps: { gap: string; framing: string }[];
};

type RichCard =
  | { kind: 'study'; study: CaseStudy }
  | { kind: 'jd' }
  | { kind: 'fit'; fit: FitResult }
  | { kind: 'resume' }
  | { kind: 'contact' };

type Line = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
  card?: RichCard;
};

function device(): 'mobile' | 'desktop' {
  return typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
}

function currentTheme(): 'light' | 'dark' {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function intentCard(question: string): RichCard | undefined {
  const q = question.toLowerCase();
  if (/\b(resume|cv)\b/.test(q)) return { kind: 'resume' };
  if (/\b(contact|email|reach you|get in touch|hire you|linkedin)\b/.test(q))
    return { kind: 'contact' };
  return undefined;
}

function Cube() {
  return (
    <svg className="hc-cube" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
      <path className="t" d="M16 3 L28 9.5 L16 16 L4 9.5 Z" />
      <path className="l" d="M4 9.5 L16 16 L16 29 L4 22.5 Z" />
      <path className="r" d="M28 9.5 L16 16 L16 29 L28 22.5 Z" />
    </svg>
  );
}

function JdCard({ onResult }: { onResult: (fit: FitResult) => void }) {
  const [mode, setMode] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    const jd = text.trim();
    if (!jd || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/fit-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, audience: 'public' }),
      });
      const data = (await res.json().catch(() => ({}))) as { result?: FitResult; error?: string };
      if (!res.ok || !data.result) {
        setError(data.error || 'I could not check that one. Please try again in a bit.');
        return;
      }
      setDone(true);
      onResult(data.result);
    } catch {
      setError('I could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hc-rich dashed">
      <div className="hc-tabs" role="tablist" aria-label="How to add the job description">
        <button
          type="button"
          role="tab"
          className="hc-tab"
          aria-selected={mode === 'paste'}
          onClick={() => setMode('paste')}
        >
          Paste text
        </button>
        <button
          type="button"
          role="tab"
          className="hc-tab"
          aria-selected={mode === 'file'}
          onClick={() => setMode('file')}
        >
          Upload file
        </button>
      </div>
      {mode === 'paste' ? (
        <textarea
          id="hc-jd-text"
          aria-label="Job description"
          placeholder="Paste the job description here"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <label className="hc-drop">
          {fileName ? `Loaded ${fileName}` : 'Choose a text file (.txt or .md)'}
          <input
            id="hc-jd-file"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 200_000) {
                setError('That file is too large. Paste the text instead.');
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                setText(String(reader.result ?? ''));
                setFileName(f.name);
                setError('');
              };
              reader.readAsText(f);
            }}
          />
        </label>
      )}
      <div className="hc-btnrow">
        <button
          type="button"
          className="hc-btn go"
          disabled={busy || done || !text.trim()}
          onClick={() => void submit()}
        >
          {busy ? 'Checking...' : done ? 'Checked' : 'Check fit'}
        </button>
        <span className="hc-hint">I will be straight about the gaps.</span>
      </div>
      {error ? <div className="hc-err">{error}</div> : null}
    </div>
  );
}

function Rich({ card, onFit }: { card: RichCard; onFit: (fit: FitResult) => void }) {
  if (card.kind === 'jd') return <JdCard onResult={onFit} />;
  if (card.kind === 'study') {
    const s = card.study;
    return (
      <div className="hc-rich">
        <h3>{s.title}</h3>
        <div className="hc-par">
          <div>
            <b>Problem</b>
            {s.problem}
          </div>
          <div>
            <b>Approach</b>
            {s.approach}
          </div>
          <div>
            <b>Result</b>
            {s.result}
          </div>
        </div>
        <div className="hc-tags">
          {s.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    );
  }
  if (card.kind === 'fit') {
    const { ats, gaps } = card.fit;
    return (
      <div className="hc-rich">
        <h3>Keyword match: {ats.score}%</h3>
        <div className="hc-bar" role="img" aria-label={`Keyword match ${ats.score} percent`}>
          <i style={{ width: `${Math.max(0, Math.min(100, ats.score))}%` }} />
        </div>
        <div className="hc-fit">
          {ats.matched.length > 0 ? (
            <div className="ok">
              <b>Matches:</b> {ats.matched.join(', ')}
            </div>
          ) : null}
          {ats.missing.length > 0 ? (
            <div className="gap">
              <b>Not on my resume:</b> {ats.missing.join(', ')}
            </div>
          ) : null}
          {gaps.map((g) => (
            <div className="gap" key={g.gap}>
              <b>{g.gap}:</b> {g.framing}
            </div>
          ))}
        </div>
        <span className="hc-hint">
          A keyword count, not a promise. Ask me about anything on the list.
        </span>
      </div>
    );
  }
  if (card.kind === 'resume') {
    return (
      <div className="hc-rich">
        <h3>Resume</h3>
        <div className="hc-btnrow">
          <Link className="hc-btn go" href="/resume">
            View resume
          </Link>
          <a className="hc-btn" href="/Resume_Jamey_McElveen.pdf" target="_blank" rel="noopener">
            Open PDF
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="hc-rich">
      <h3>Contact</h3>
      <div className="hc-btnrow">
        <span className="hc-btn go">
          <ObfuscatedEmail />
        </span>
        <a
          className="hc-btn"
          href="https://www.linkedin.com/in/jameymcelveen"
          target="_blank"
          rel="noopener"
        >
          LinkedIn
        </a>
        <a
          className="hc-btn"
          href="https://github.com/jameymcelveen"
          target="_blank"
          rel="noopener"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}

export function HomeChat({ skills }: { skills: string[] }) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [showCoverLetters, setShowCoverLetters] = useState(false);
  const showDashboard = useInsightsAvailable();
  const polaroidRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef(0);

  useEffect(() => {
    setTheme(currentTheme());
    if (sessionStorage.getItem('cover-letters-auth') === 'true') setShowCoverLetters(true);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(currentTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lines, open]);

  const toggleTheme = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* not saved; still applied */
    }
    setTheme(next);
  };

  const push = useCallback((line: Line) => setLines((prev) => [...prev, line]), []);
  const patch = useCallback(
    (id: string, part: Partial<Line>) =>
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...part } : l))),
    []
  );

  const ask = useCallback(
    async (raw: string, opts?: { chip?: boolean; study?: CaseStudy }) => {
      const message = raw.trim();
      if (!message || busy) return;
      if (!open) {
        openedAtRef.current = Date.now();
        setOpen(true);
        window.scrollTo({ top: 0 });
      }
      const referrer = document.referrer || null;
      if (opts?.chip) {
        postInsightEvent({
          event: 'chip_click',
          page: '/',
          chip_label: message,
          referrer,
          device: device(),
        });
      }
      setInput('');
      push({ id: crypto.randomUUID(), role: 'user', text: message });

      if (
        message === JD_CHIP ||
        /\b(job description|check (my|a|this) (jd|job|role|posting))\b/i.test(message)
      ) {
        push({
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Sure. Paste the job description and I will check it against my background.',
          card: { kind: 'jd' },
        });
        return;
      }

      postInsightEvent({
        event: 'ask_jamey_question',
        page: '/',
        question: message,
        referrer,
        device: device(),
        chat_duration_sec: Math.round((Date.now() - (openedAtRef.current || Date.now())) / 1000),
      });

      setBusy(true);
      const id = crypto.randomUUID();
      const card: RichCard | undefined = opts?.study
        ? { kind: 'study', study: opts.study }
        : intentCard(message);
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
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          push({ id, role: 'assistant', text: data.error || `Request failed (${res.status}).` });
          return;
        }
        push({ id, role: 'assistant', text: '', streaming: true });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let acc = '';
        let failed = false;
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() ?? '';
          for (const msg of messages) {
            for (const row of msg.split('\n')) {
              if (!row.startsWith('data: ')) continue;
              const payload = row.slice(6);
              if (payload === '[DONE]') break outer;
              try {
                const parsed = JSON.parse(payload) as { delta?: string; error?: string };
                if (parsed.delta) {
                  acc += parsed.delta;
                  patch(id, { text: acc });
                } else if (parsed.error) {
                  acc = parsed.error;
                  failed = true;
                  break outer;
                }
              } catch {
                /* ignore a partial frame */
              }
            }
          }
        }
        patch(id, {
          text: acc || 'No response received.',
          streaming: false,
          card: failed ? undefined : card,
        });
      } catch {
        setLines((prev) =>
          prev.some((l) => l.id === id)
            ? prev.map((l) =>
                l.id === id
                  ? {
                      ...l,
                      text: l.text || 'Something went wrong. Please try again.',
                      streaming: false,
                    }
                  : l
              )
            : [...prev, { id, role: 'assistant', text: 'Something went wrong. Please try again.' }]
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, open, patch, push]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  const onFit = useCallback(
    (fit: FitResult) =>
      push({
        id: crypto.randomUUID(),
        role: 'assistant',
        text: 'Here is how the posting lines up with my resume, gaps included.',
        card: { kind: 'fit', fit },
      }),
    [push]
  );

  const onHeroMove = (e: MouseEvent<HTMLElement>) => {
    const el = polaroidRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotate(${-3 + x * 5}deg) translate(${x * 8}px, ${y * 5}px)`;
  };
  const onHeroLeave = () => {
    if (polaroidRef.current) polaroidRef.current.style.transform = '';
  };
  const onCardMove = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const lastAssistantId = [...lines].reverse().find((l) => l.role === 'assistant')?.id;

  return (
    <div className="hc">
      <header className="hc-top">
        <button
          type="button"
          className="hc-brand"
          onClick={() => setOpen(false)}
          aria-label="Jamey McElveen, overview"
        >
          <Cube />
          <span>
            Jamey <b>McElveen</b>
          </span>
        </button>
        <nav className="hc-nav" aria-label="Site">
          <Link href="/blog">Blog</Link>
          <Link href="/resume">Resume</Link>
          <a href="mailto:jamey@mcelveen.us">Contact</a>
          {showDashboard ? <Link href="/dashboard">Insights</Link> : null}
          {showCoverLetters ? <Link href="/cover-letters">Cover Letters</Link> : null}
        </nav>
        <div className="hc-right">
          <span className="hc-status">
            <i className="hc-dot" aria-hidden />
            <span className="lbl">Ask Jamey:</span> online
          </span>
          <button
            type="button"
            className="hc-iconbtn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
          </button>
        </div>
      </header>

      <main className="hc-col">
        {!open ? (
          <>
            <section className="hc-hero" onMouseMove={onHeroMove} onMouseLeave={onHeroLeave}>
              <div className="hc-polaroid hc-reveal" ref={polaroidRef}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTO} alt="Jamey McElveen" width={128} height={128} />
              </div>
              <div className="hc-eyebrow hc-reveal" style={{ animationDelay: '0.1s' }}>
                Principal Software Architect
              </div>
              <h1 className="hc-h1 hc-reveal" style={{ animationDelay: '0.2s' }}>
                30-year software architect still chasing my passion.
              </h1>
              <p className="hc-sub hc-reveal" style={{ animationDelay: '0.3s' }}>
                .NET, Cloud APIs, Healthcare and Church Software, AI-Assisted Engineering
              </p>
              <form
                className={`hc-ask hc-reveal${focused ? '' : 'glow'}`}
                style={{ animationDelay: '0.4s' }}
                onSubmit={onSubmit}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={AVATAR} alt="" width={34} height={34} />
                <input
                  id="hc-ask-input"
                  type="text"
                  aria-label="Ask Jamey a question"
                  placeholder="Ask me about myself"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="hc-send"
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  ↑
                </button>
              </form>
              <div className="hc-chips hc-reveal" style={{ animationDelay: '0.5s' }}>
                {STARTER_CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="hc-chip"
                    onClick={() => void ask(c, { chip: true })}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>

            <div className="hc-sechead">
              <h2>What I&apos;ve built</h2>
              <span>Pick one. Ask Jamey has the details.</span>
            </div>
            <div className="hc-grid">
              {BUILT.map((b, i) => (
                <div key={b.key} className="hc-drift" style={{ animationDelay: `${-i * 1.5}s` }}>
                  <button
                    type="button"
                    className="hc-built"
                    style={{ ['--tint' as string]: b.tint }}
                    onMouseMove={onCardMove}
                    onClick={() => void ask(b.question, { chip: true, study: b.study })}
                  >
                    <span className="hc-built-top">
                      <span className="hc-tile" style={{ background: b.tile }}>
                        {b.icon}
                      </span>
                      <span className="hc-built-eyebrow">{b.eyebrow}</span>
                    </span>
                    <span className="hc-built-title">{b.title}</span>
                    <span className="hc-q">{b.question}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="hc-pills">
              {skills.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="hc-pill"
                  onClick={() => void ask(`Tell me about your ${s} experience`, { chip: true })}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="hc-contact">
              <Link href="/resume">View resume</Link>
              <ObfuscatedEmail />
              <span>Timmonsville, SC · Eastern</span>
            </div>
          </>
        ) : (
          <section className="hc-convo" aria-live="polite">
            <div className="hc-convo-head">
              <button type="button" className="hc-back" onClick={() => setOpen(false)}>
                ← Overview
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={AVATAR} alt="" width={38} height={38} />
              <div className="hc-who">
                <b>Ask Jamey</b>
                <span>AI interview twin · answers in Jamey&apos;s voice</span>
              </div>
              <button
                type="button"
                className="hc-startover"
                onClick={() => {
                  setLines([]);
                  setOpen(false);
                }}
              >
                Start over
              </button>
            </div>

            <div className="hc-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={AVATAR} alt="" width={30} height={30} />
              <div className="hc-bubble">{OPENING_MESSAGE}</div>
            </div>

            {lines.map((l) =>
              l.role === 'user' ? (
                <div className="hc-row user" key={l.id}>
                  <div className="hc-bubble">{l.text}</div>
                </div>
              ) : (
                <div className="hc-row" key={l.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={AVATAR} alt="" width={30} height={30} />
                  <div className="hc-stack">
                    <div className="hc-bubble">
                      {l.streaming && !l.text ? (
                        <span className="hc-think" aria-label="Thinking">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{l.text}</ReactMarkdown>
                          {l.streaming ? <span className="hc-cursor" aria-hidden /> : null}
                        </>
                      )}
                    </div>
                    {!l.streaming && l.card ? <Rich card={l.card} onFit={onFit} /> : null}
                    {!l.streaming && !busy && l.id === lastAssistantId && l.card?.kind !== 'jd' ? (
                      <div className="hc-chips" style={{ justifyContent: 'flex-start' }}>
                        {FOLLOW_UPS.filter(
                          (f) => !lines.some((x) => x.role === 'user' && x.text === f)
                        ).map((f) => (
                          <button
                            key={f}
                            type="button"
                            className="hc-chip"
                            onClick={() => void ask(f, { chip: true })}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            )}
            <div ref={endRef} />

            <div className="hc-composer-wrap">
              <form className="hc-ask" onSubmit={onSubmit}>
                <button
                  type="button"
                  className="hc-plus"
                  aria-label="Check a job description"
                  title="Check a job description"
                  disabled={busy}
                  onClick={() => void ask(JD_CHIP, { chip: true })}
                >
                  ＋
                </button>
                <input
                  id="hc-followup-input"
                  type="text"
                  aria-label="Ask a follow-up"
                  placeholder="Ask a follow-up..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="hc-send"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                >
                  ↑
                </button>
              </form>
              <div className="hc-disclaimer">
                AI-generated from curated context. Not guarantees.
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="hc-foot">
        <span>jameymcelveen.com</span>
        <span>
          Built with AI, reviewed by Jamey{' '}
          <Link
            href="/bobiverse"
            aria-label="Just for fun"
            title="Just for fun"
            style={{ textDecoration: 'none' }}
          >
            🚀
          </Link>
        </span>
      </footer>

      <SecretLock
        onUnlock={() => setShowCoverLetters(true)}
        onLock={() => setShowCoverLetters(false)}
      />
    </div>
  );
}
