'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { VisitorMap } from '@/components/dashboard/VisitorMap';

const nf = new Intl.NumberFormat();

const PIE_COLORS = ['#522d80', '#f56600', '#0ea5e9', '#22c55e', '#d1d5db'];

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

function trafficLabel(source: string): string {
  const s = source.toLowerCase();
  if (s === '(direct)') return 'Direct';
  if (s.includes('linkedin')) return 'LinkedIn';
  if (s.includes('google.')) return 'Google';
  if (s.includes('github')) return 'GitHub';
  if (s.includes('bing.')) return 'Bing';
  return source.length > 32 ? `${source.slice(0, 30)}…` : source;
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
    <div className={`glass-card rounded-[var(--radius-card)] p-5 sm:p-6 ${className}`} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <DashCard>
      <p className="text-[var(--text-muted)] font-mono text-[0.68rem] tracking-[0.12em] uppercase">{label}</p>
      <p className="text-foreground mt-2.5 text-[2.1rem] font-semibold leading-none tracking-tight sm:text-[2.4rem]">
        {value}
      </p>
      <p className="text-[var(--text-secondary)] mt-1.5 text-[0.78rem] leading-snug">{sub}</p>
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
  if (!iso || !name) return <span className="text-[var(--text-muted)] shrink-0 text-[0.75rem]">—</span>;
  return (
    <span className="text-[var(--text-muted)] shrink-0 text-[0.75rem] whitespace-nowrap">
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

  const refresh = useCallback(async () => {
    try {
      const [sRes, qRes, fRes] = await Promise.all([
        fetch('/api/analytics/summary', { cache: 'no-store' }),
        fetch('/api/analytics/questions', { cache: 'no-store' }),
        fetch('/api/analytics/feed', { cache: 'no-store' }),
      ]);
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
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    setChartReady(true);
  }, []);

  const connected = summary?.connected ?? false;

  const topQ = questions?.items ?? [];
  const maxQ = useMemo(() => Math.max(1, ...topQ.map((r) => r.count)), [topQ]);

  const pieData = useMemo(
    () =>
      (summary?.trafficSources ?? []).map((row) => ({
        name: trafficLabel(row.source),
        value: row.count,
        percent: row.percent,
      })),
    [summary?.trafficSources]
  );

  const feedSlice = (feed?.items ?? []).slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 pb-16 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col items-start justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-foreground text-[1.75rem] font-semibold tracking-tight">Site Insights</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm leading-relaxed">
            jameymcelveen.com · built in-house · no third-party trackers
          </p>
        </div>
        <div className="btn-glass btn-glass--sm text-[var(--text-muted)] flex items-center gap-1.5 font-mono text-[0.72rem] tracking-wide">
          <span className="dash-live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" aria-hidden />
          LIVE · updates every 60s
          {summary?.updatedAt ? (
            <span className="text-[var(--text-muted)]/80 ml-1 hidden font-normal sm:inline">
              · {new Date(summary.updatedAt).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </header>

      {!connected ? (
        <DashCard className="mb-6 border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-900/90 dark:text-amber-100/90">
            <strong className="font-medium">Database not connected.</strong> Set{' '}
            <code className="font-mono text-xs">DATABASE_URL</code> on the host and run{' '}
            <code className="font-mono text-xs">migrations/001_analytics_events.sql</code>. Until then, counts stay at
            zero — the UI is the portfolio piece.
          </p>
        </DashCard>
      ) : null}

      {connected && summary?.database ? (
        <DashCard className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[var(--text-muted)] font-mono text-[10px] tracking-[0.22em] uppercase">
                Postgres database size
              </h2>
              <p className="text-foreground mt-1 font-mono text-lg font-semibold tracking-tight sm:text-xl">
                {formatBytes(summary.database.usedBytes)}
                <span className="text-[var(--text-muted)] font-normal">
                  {' '}
                  / {formatBytes(summary.database.limitBytes)}
                </span>
              </p>
              <p className="text-[var(--text-secondary)] mt-1 text-xs leading-relaxed">
                Neon storage — set <code className="font-mono text-[10px]">ANALYTICS_DB_LIMIT_BYTES</code> if your plan
                differs.
              </p>
            </div>
            <div className="w-full sm:max-w-xs sm:shrink-0">
              <div className="bg-foreground/10 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-[var(--accent-blue)] h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (summary.database.usedBytes / Math.max(1, summary.database.limitBytes)) * 100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[var(--text-muted)] mt-1 text-right font-mono text-[10px]">
                {Math.min(
                  100,
                  Math.round((summary.database.usedBytes / Math.max(1, summary.database.limitBytes)) * 1000) / 10
                )}
                % of cap
              </p>
            </div>
          </div>
        </DashCard>
      ) : null}

      {error ? (
        <p className="text-red-500 mb-6 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {/* Stat row */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-6 lg:grid-cols-4 lg:gap-4">
        <StatBlock label="Total visits" value={nf.format(summary?.stats.totalVisits ?? 0)} sub="All time · page views" />
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
          <h3 className="text-foreground text-[0.95rem] font-semibold">Visits · last 30 days</h3>
          <p className="text-[var(--text-secondary)] mt-1 text-[0.8rem] leading-snug">
            Daily page views across all routes
          </p>
          <div className="mt-5 h-[220px] w-full min-h-[200px] min-w-0 sm:h-[240px]">
            {chartReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.timeline ?? []} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashVisitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(82,45,128,0.14)" />
                      <stop offset="100%" stopColor="rgba(82,45,128,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
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
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
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
              <div className="bg-foreground/5 h-full w-full animate-pulse rounded-lg" aria-hidden />
            )}
          </div>
        </DashCard>

        <DashCard>
          <h3 className="text-foreground text-[0.95rem] font-semibold">Top Ask Jamey Questions</h3>
          <p className="text-[var(--text-secondary)] mt-1 text-[0.8rem] leading-snug">
            Most asked by recruiters and visitors
          </p>
          <ul className="mt-5 list-none">
            {topQ.length ? (
              topQ.slice(0, 6).map((row, i) => (
                <li key={`${row.question}-${i}`} className="border-b border-[var(--steel)]/80 py-3 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground min-w-0 flex-1 text-[0.88rem] leading-snug">{row.question}</span>
                    <div className="bg-foreground/8 h-1.5 w-[120px] max-w-[30%] shrink-0 overflow-hidden rounded-full sm:max-w-[120px]">
                      <div
                        className="bg-[var(--accent-blue)] h-full rounded-full"
                        style={{ width: `${Math.round((row.count / maxQ) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[var(--text-muted)] w-7 shrink-0 text-right font-mono text-[0.75rem]">
                      {nf.format(row.count)}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-[var(--text-muted)] py-4 text-sm">No questions recorded yet.</li>
            )}
          </ul>
        </DashCard>
      </section>

      {/* Traffic doughnut + Pages / Referrers */}
      <section className="mb-6 grid gap-4 lg:grid-cols-2 lg:gap-4">
        <DashCard>
          <h3 className="text-foreground text-[0.95rem] font-semibold">Traffic Sources</h3>
          <p className="text-[var(--text-secondary)] mt-1 text-[0.8rem] leading-snug">Where visitors are coming from</p>
          <div className="relative mx-auto mt-2 h-[220px] w-full max-w-[280px] sm:h-[240px]">
            {chartReady && pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="46%"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={1}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const p = item?.payload as { percent?: number; name?: string } | undefined;
                      return [`${p?.percent ?? 0}% · ${nf.format(Number(value ?? 0))}`, p?.name ?? ''];
                    }}
                    contentStyle={{
                      background: 'rgba(255,255,255,0.94)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={44}
                    formatter={(value) => <span className="text-[var(--text-secondary)] text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[var(--text-muted)] flex h-full items-center justify-center text-sm">
                No referrer data yet.
              </p>
            )}
          </div>
        </DashCard>

        <DashCard>
          <h3 className="text-foreground text-[0.95rem] font-semibold">Top Pages + Sources</h3>
          <p className="text-[var(--text-secondary)] mt-1 text-[0.8rem] leading-snug">Most visited routes and referrers</p>
          <div className="mt-5 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-[var(--text-muted)] mb-3 font-mono text-[0.68rem] tracking-[0.12em] uppercase">Pages</p>
              <ul>
                {(summary?.topPages.length ? summary.topPages : []).slice(0, 6).map((row) => (
                  <li key={row.path} className="flex items-center justify-between gap-3 border-b border-[var(--steel)]/80 py-2.5 text-[0.87rem] last:border-0">
                    <span className="text-foreground truncate">{row.path}</span>
                    <span className="text-[var(--accent-blue)] shrink-0 font-mono text-[0.78rem] font-semibold">
                      {nf.format(row.views)}
                    </span>
                  </li>
                ))}
                {!summary?.topPages.length ? (
                  <li className="text-[var(--text-muted)] text-sm">No page views yet.</li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="text-[var(--text-muted)] mb-3 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                Referrers
              </p>
              <ul>
                {(summary?.trafficSources.length ? summary.trafficSources : []).slice(0, 6).map((row) => (
                  <li key={row.source} className="flex items-center justify-between gap-3 border-b border-[var(--steel)]/80 py-2.5 text-[0.87rem] last:border-0">
                    <span className="text-foreground truncate">{trafficLabel(row.source)}</span>
                    <span className="text-[var(--accent-blue)] shrink-0 font-mono text-[0.78rem] font-semibold">
                      {row.percent}%
                    </span>
                  </li>
                ))}
                {!summary?.trafficSources.length ? (
                  <li className="text-[var(--text-muted)] text-sm">No referrer data yet.</li>
                ) : null}
              </ul>
            </div>
          </div>
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
            <span className="text-[var(--text-muted)] font-normal text-[0.85rem]">· live</span>
          </h3>
          <p className="text-[var(--text-secondary)] mt-1 text-[0.8rem] leading-snug">
            What recruiters and visitors are asking right now
          </p>
          <div className="mt-4">
            {feedSlice.length ? (
              feedSlice.map((row, i) => (
                <div
                  key={`${row.createdAt}-${i}`}
                  className="flex flex-col gap-1 border-b border-[var(--steel)]/80 py-3 last:border-0 sm:flex-row sm:items-start sm:gap-3.5"
                >
                  <span className="text-[var(--text-muted)] w-[4.5rem] shrink-0 font-mono text-[0.72rem] tracking-tight">
                    {formatAgo(row.createdAt)}
                  </span>
                  <span className="text-foreground min-w-0 flex-1 text-[0.87rem] leading-relaxed">{row.question}</span>
                  <FeedLocation iso={row.country} />
                </div>
              ))
            ) : (
              <p className="text-[var(--text-muted)] py-4 text-sm">No recent questions yet.</p>
            )}
          </div>
        </DashCard>
      </section>

      <footer className="text-[var(--text-muted)] mx-auto mt-8 max-w-[1100px] text-center text-[0.78rem] leading-relaxed">
        <strong className="text-[var(--text-secondary)]">Privacy:</strong> approximate location (country/region from IP
        — raw IP not stored), page paths, referrers (hostname only), device class, Ask Jamey questions, and resume
        activity. No cookies. No cross-site tracking.
        <span className="mt-3 block text-[10px]">
          Starter chip clicks (all time): {nf.format(summary?.stats.chipClicks ?? 0)}
        </span>
      </footer>
    </div>
  );
}
