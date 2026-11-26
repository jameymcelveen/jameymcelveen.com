'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { VisitorMap } from '@/components/dashboard/VisitorMap';
import { groupTrafficSources } from '@/lib/dashboard/traffic-sources';
import {
  insightsHeaders,
  readInsightsKey,
  saveInsightsKey,
  subscribeInsightsKey,
} from '@/lib/insights-key';

const nf = new Intl.NumberFormat();

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u += 1;
  }
  const d = u === 0 ? 0 : u === 1 ? 1 : 2;
  return `${v.toFixed(d)} ${units[u]}`;
}

function formatAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const sec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr} hr ago`;
  const d = Math.round(hr / 24);
  return `${d} days ago`;
}

function iso2ToFlag(iso: string | null | undefined): string {
  if (!iso || iso.length < 2) return '';
  const c = iso.toUpperCase();
  if (c.length !== 2 || /[^A-Z]/.test(c)) return '';
  const A = 0x1f1e6;
  const cp = (ch: string) => A + (ch.charCodeAt(0) - 65);
  return String.fromCodePoint(cp(c[0]), cp(c[1]));
}

type SummaryPayload = {
  connected: boolean;
  stats: {
    totalVisits: number;
    askJameyChats: number;
    chipClicks: number;
    countries: number;
    resumeViews: number;
  };
  timeline: { day: string; visits: number }[];
  topPages: { path: string; views: number }[];
  trafficSources: { source: string; count: number; percent: number }[];
  countryCounts: { country: string; count: number }[];
  database: { usedBytes: number; limitBytes: number } | null;
  updatedAt: string;
};

type QuestionsPayload = { connected: boolean; items: { question: string; count: number }[] };
type FeedPayload = {
  connected: boolean;
  items: { question: string; createdAt: string; country?: string | null }[];
};

function DashCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card rounded-[var(--radius-card)] p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <DashCard>
      <p className="font-mono text-[0.68rem] tracking-[0.12em] text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2.5 text-[2.1rem] leading-none font-semibold tracking-tight sm:text-[2.4rem]">
        {value}
      </p>
      <p className="mt-1.5 text-[0.78rem] leading-snug text-[var(--text-secondary)]">{sub}</p>
    </DashCard>
  );
}

function FeedLocation({ iso }: { iso: string | null | undefined }) {
  const name = useMemo(() => {
    if (!iso || iso.length !== 2) return '';
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso.toUpperCase()) ?? iso;
    } catch {
      return iso;
    }
  }, [iso]);
  if (!iso || !name)
    return <span className="shrink-0 text-[0.75rem] text-[var(--text-muted)]">—</span>;
  return (
    <span className="shrink-0 text-[0.75rem] whitespace-nowrap text-[var(--text-muted)]">
      <span className="mr-1" aria-hidden>
        {iso2ToFlag(iso)}
      </span>
      {name}
    </span>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [questions, setQuestions] = useState<QuestionsPayload | null>(null);
  const [feed, setFeed] = useState<FeedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);

  // null on the server; the stored key (or '') once in the browser.
  const authKey = useSyncExternalStore<string | null>(
    subscribeInsightsKey,
    readInsightsKey,
    () => null
  );
  const [signInError, setSignInError] = useState('');

  const refresh = useCallback(async () => {
    if (!authKey) return;
    try {
      const init = { cache: 'no-store' as const, headers: insightsHeaders(authKey) };
      const [sRes, qRes, fRes] = await Promise.all([
        fetch('/api/analytics/summary', init),
        fetch('/api/analytics/questions', init),
        fetch('/api/analytics/feed', init),
      ]);
      if (sRes.status === 401 || qRes.status === 401 || fRes.status === 401) {
        saveInsightsKey('');
        setSignInError('That password did not work.');
        return;
      }
      if (!sRes.ok || !qRes.ok || !fRes.ok) {
        setError('Could not load analytics.');
        return;
      }
      const s = (await sRes.json()) as SummaryPayload;
      const q = (await qRes.json()) as QuestionsPayload;
      const f = (await fRes.json()) as FeedPayload;
      setSummary(s);
      setQuestions(q);
      setFeed(f);
      setError(null);
    } catch {
      setError('Could not load analytics.');
    }
  }, [authKey]);

  useEffect(() => {
    if (!authKey) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [authKey, refresh]);

  useEffect(() => {
    setChartReady(true);
  }, []);

  const connected = summary?.connected === true;
  const unavailable = Boolean(error) || (summary !== null && !connected);

  const topQ = questions?.items ?? [];
  const maxQ = useMemo(() => Math.max(1, ...topQ.map((r) => r.count)), [topQ]);

  const traffic = useMemo(() => {
    const groups = groupTrafficSources(summary?.trafficSources ?? []);
    const direct = groups.find((g) => g.label === 'Direct');
    const referred = groups.filter((g) => g.label !== 'Direct');
    const maxRef = Math.max(1, ...referred.map((g) => g.count));
    return { direct, referred, maxRef, total: groups.reduce((n, g) => n + g.count, 0) };
  }, [summary?.trafficSources]);

  const feedSlice = (feed?.items ?? []).slice(0, 6);

  if (authKey === null) return null;
  if (!authKey) {
    return (
      <InsightsSignIn
        error={signInError}
        onSubmit={(password) => {
          setSignInError('');
          saveInsightsKey(password);
        }}
      />
    );
  }

  return (
    <div className="page-studio">
      {/* Header */}
      <header className="mb-8 flex flex-col items-start justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-foreground text-[1.75rem] font-semibold tracking-tight">
            Site Insights
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
            jameymcelveen.com · built in-house · no third-party trackers
          </p>
        </div>
        {connected ? (
          <div className="btn-glass btn-glass--sm flex items-center gap-1.5 font-mono text-[0.72rem] tracking-wide text-[var(--text-muted)]">
            <span
              className="dash-live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]"
              aria-hidden
            />
            LIVE · updates every 60s
            {summary?.updatedAt ? (
              <span className="ml-1 hidden font-normal text-[var(--text-muted)]/80 sm:inline">
                · {new Date(summary.updatedAt).toLocaleTimeString()}
              </span>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          className="btn-glass btn-glass--sm font-mono text-[0.72rem] text-[var(--text-muted)]"
          onClick={() => {
            saveInsightsKey('');
          }}
        >
          Sign out
        </button>
      </header>

      {unavailable ? (
        <DashCard className="mb-6">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Insights unavailable
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            The analytics database is not reachable right now. Try again in a bit.
          </p>
        </DashCard>
      ) : null}

      {connected && summary?.database ? (
        <DashCard className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)] uppercase">
                Postgres database size
              </h2>
              <p className="text-foreground mt-1 font-mono text-lg font-semibold tracking-tight sm:text-xl">
                {formatBytes(summary.database.usedBytes)}
                <span className="font-normal text-[var(--text-muted)]">
                  {' '}
                  / {formatBytes(summary.database.limitBytes)}
                </span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                Neon storage — set{' '}
                <code className="font-mono text-[10px]">ANALYTICS_DB_LIMIT_BYTES</code> if your plan
                differs.
              </p>
            </div>
            <div className="w-full sm:max-w-xs sm:shrink-0">
              <div className="bg-foreground/10 h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-[var(--accent-blue)] transition-[width] duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (summary.database.usedBytes / Math.max(1, summary.database.limitBytes)) * 100
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-right font-mono text-[10px] text-[var(--text-muted)]">
                {Math.min(
                  100,
                  Math.round(
                    (summary.database.usedBytes / Math.max(1, summary.database.limitBytes)) * 1000
                  ) / 10
                )}
                % of cap
              </p>
            </div>
          </div>
        </DashCard>
      ) : null}

      {connected ? (
        <>
          {/* Stat row */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-6 lg:grid-cols-4 lg:gap-4">
            <StatBlock
              label="Total visits"
              value={nf.format(summary?.stats.totalVisits ?? 0)}
              sub="All time · page views"
            />
            <StatBlock
              label="Ask Jamey chats"
              value={nf.format(summary?.stats.askJameyChats ?? 0)}
              sub="All time · questions sent"
            />
            <StatBlock
              label="Countries"
              value={nf.format(summary?.stats.countries ?? 0)}
              sub="Unique countries reached"
            />
            <StatBlock
              label="Resume views"
              value={nf.format(summary?.stats.resumeViews ?? 0)}
              sub="Views + preview & print"
            />
          </section>

          {/* Visits chart + Top questions */}
          <section className="mb-6 grid gap-4 lg:grid-cols-2 lg:gap-4">
            <DashCard>
              <h3 className="text-foreground text-[0.95rem] font-semibold">
                Visits · last 30 days
              </h3>
              <p className="mt-1 text-[0.8rem] leading-snug text-[var(--text-secondary)]">
                Daily page views across all routes
              </p>
              <div className="mt-5 h-[220px] min-h-[200px] w-full min-w-0 sm:h-[240px]">
                {chartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={summary?.timeline ?? []}
                      margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="dashVisitFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(82,45,128,0.14)" />
                          <stop offset="100%" stopColor="rgba(82,45,128,0)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{
                          fill: 'var(--text-muted)',
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                        }}
                        tickFormatter={(v) => {
                          const d = String(v).slice(5);
                          const [m, day] = d.split('-');
                          const months = [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                          ];
                          const mi = Number(m) - 1;
                          return mi >= 0 && mi < 12 ? `${months[mi]} ${Number(day)}` : d;
                        }}
                        interval="preserveStartEnd"
                        minTickGap={28}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fill: 'var(--text-muted)',
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                        }}
                        width={36}
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.92)',
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                        formatter={(v) => [`${nf.format(Number(v ?? 0))} visits`, '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        stroke="var(--accent-blue)"
                        strokeWidth={2}
                        fill="url(#dashVisitFill)"
                        dot={false}
                        activeDot={{ r: 4, fill: 'var(--accent-blue)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="bg-foreground/5 h-full w-full animate-pulse rounded-lg"
                    aria-hidden
                  />
                )}
              </div>
            </DashCard>

            <DashCard>
              <h3 className="text-foreground text-[0.95rem] font-semibold">
                Top Ask Jamey Questions
              </h3>
              <p className="mt-1 text-[0.8rem] leading-snug text-[var(--text-secondary)]">
                Most asked by recruiters and visitors
              </p>
              <ul className="mt-5 list-none">
                {topQ.length ? (
                  topQ.slice(0, 6).map((row, i) => (
                    <li
                      key={`${row.question}-${i}`}
                      className="border-b border-[var(--steel)]/80 py-3 last:border-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-foreground min-w-0 flex-1 text-[0.88rem] leading-snug">
                          {row.question}
                        </span>
                        <div className="h-1.5 w-[120px] max-w-[30%] shrink-0 overflow-hidden rounded-full bg-[var(--surface-2)] sm:max-w-[120px]">
                          <div
                            className="h-full rounded-full bg-[var(--accent-blue)]"
                            style={{ width: `${Math.round((row.count / maxQ) * 100)}%` }}
                          />
                        </div>
                        <span className="w-7 shrink-0 text-right font-mono text-[0.75rem] text-[var(--text-muted)]">
                          {nf.format(row.count)}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-4 text-sm text-[var(--text-muted)]">
                    No questions recorded yet.
                  </li>
                )}
              </ul>
            </DashCard>
          </section>

          {/* Traffic doughnut + Pages / Referrers */}
          <section className="mb-6 grid gap-4 lg:grid-cols-2 lg:gap-4">
            <DashCard>
              <h3 className="text-foreground text-[0.95rem] font-semibold">Traffic Sources</h3>
              <p className="mt-1 text-[0.8rem] leading-snug text-[var(--text-secondary)]">
                Where visitors are coming from
              </p>
              {traffic.total ? (
                <>
                  <p className="text-foreground mt-4 text-[0.87rem]">
                    <span className="text-[1.6rem] leading-none font-semibold tracking-tight text-[var(--accent-blue)]">
                      {traffic.direct ? `${traffic.direct.percent}%` : '0%'}
                    </span>{' '}
                    <span className="text-[var(--text-secondary)]">
                      direct (typed URL, bookmarks, apps that hide the referrer)
                    </span>
                  </p>
                  <p className="mt-4 mb-2 font-mono text-[0.68rem] tracking-[0.12em] text-[var(--text-muted)] uppercase">
                    Referred visits
                  </p>
                  {traffic.referred.length ? (
                    <ul className="space-y-2.5">
                      {traffic.referred.map((g) => (
                        <li key={g.label}>
                          <div className="flex items-baseline justify-between gap-3 text-[0.87rem]">
                            <span className="text-foreground truncate">{g.label}</span>
                            <span className="shrink-0 font-mono text-[0.78rem] text-[var(--text-secondary)]">
                              {nf.format(g.count)} · {g.percent}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--steel)]">
                            <div
                              className="h-full rounded-full bg-[var(--accent-blue)]"
                              style={{ width: `${Math.max(4, (g.count / traffic.maxRef) * 100)}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">
                      Every visit so far arrived directly.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-[var(--text-muted)]">No referrer data yet.</p>
              )}
            </DashCard>

            <DashCard>
              <h3 className="text-foreground text-[0.95rem] font-semibold">Top Pages</h3>
              <p className="mt-1 text-[0.8rem] leading-snug text-[var(--text-secondary)]">
                Most visited routes
              </p>
              <ul className="mt-4">
                {(summary?.topPages.length ? summary.topPages : []).slice(0, 8).map((row) => (
                  <li
                    key={row.path}
                    className="flex items-center justify-between gap-3 border-b border-[var(--steel)]/80 py-2.5 text-[0.87rem] last:border-0"
                  >
                    <span className="text-foreground truncate">{row.path}</span>
                    <span className="shrink-0 font-mono text-[0.78rem] font-semibold text-[var(--accent-blue)]">
                      {nf.format(row.views)}
                    </span>
                  </li>
                ))}
                {!summary?.topPages.length ? (
                  <li className="text-sm text-[var(--text-muted)]">No page views yet.</li>
                ) : null}
              </ul>
            </DashCard>
          </section>

          {/* Visitor map — full width */}
          <section className="mb-6">
            <VisitorMap countryCounts={summary?.countryCounts ?? []} />
          </section>

          {/* Live feed */}
          <section className="mb-6">
            <DashCard>
              <h3 className="text-foreground text-[0.95rem] font-semibold">
                Recent Ask Jamey Questions{' '}
                <span className="text-[0.85rem] font-normal text-[var(--text-muted)]">· live</span>
              </h3>
              <p className="mt-1 text-[0.8rem] leading-snug text-[var(--text-secondary)]">
                What recruiters and visitors are asking right now
              </p>
              <div className="mt-4">
                {feedSlice.length ? (
                  feedSlice.map((row, i) => (
                    <div
                      key={`${row.createdAt}-${i}`}
                      className="flex flex-col gap-1 border-b border-[var(--steel)]/80 py-3 last:border-0 sm:flex-row sm:items-start sm:gap-3.5"
                    >
                      <span className="w-[4.5rem] shrink-0 font-mono text-[0.72rem] tracking-tight text-[var(--text-muted)]">
                        {formatAgo(row.createdAt)}
                      </span>
                      <span className="text-foreground min-w-0 flex-1 text-[0.87rem] leading-relaxed">
                        {row.question}
                      </span>
                      <FeedLocation iso={row.country} />
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-sm text-[var(--text-muted)]">No recent questions yet.</p>
                )}
              </div>
            </DashCard>
          </section>

          <footer className="relative z-[1] mt-8 text-center text-[0.78rem] leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-secondary)]">Privacy:</strong> approximate location
            (country/region from IP — raw IP not stored), page paths, referrers (hostname only),
            device class, Ask Jamey questions, and resume activity. No cookies. No cross-site
            tracking.
            <span className="mt-3 block text-[10px]">
              Starter chip clicks (all time): {nf.format(summary?.stats.chipClicks ?? 0)}
            </span>
          </footer>
        </>
      ) : null}
    </div>
  );
}

function InsightsSignIn({
  error,
  onSubmit,
}: {
  error: string;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState('');
  return (
    <div className="page-studio">
      <form
        className="glass-card mx-auto mt-16 flex max-w-sm flex-col gap-3 rounded-xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const value = password.trim();
          if (value) onSubmit(value);
        }}
      >
        <h1 className="text-foreground text-lg font-semibold tracking-tight">Site Insights</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          This page is private. Enter the password.
        </p>
        <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
          Password
          <input
            type="password"
            autoComplete="current-password"
            className="border-steel bg-surface text-foreground rounded-lg border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </label>
        {error ? (
          <p className="text-sm text-[#d0683a]" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-glass text-foreground px-4 py-2">
          Sign in
        </button>
      </form>
    </div>
  );
}
