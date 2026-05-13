'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { VisitorMap } from '@/components/dashboard/VisitorMap';

const nf = new Intl.NumberFormat();

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
  updatedAt: string;
};

type QuestionsPayload = { connected: boolean; items: { question: string; count: number }[] };
type FeedPayload = { connected: boolean; items: { question: string; createdAt: string }[] };

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className="glass-card rounded-[var(--radius-card)] border border-[var(--glass-border)] p-5 sm:p-6"
      style={{ willChange: 'transform' }}
    >
      <p className="text-[var(--text-muted)] font-mono text-[10px] tracking-[0.2em] uppercase">{label}</p>
      <p className="text-foreground mt-2 font-mono text-3xl font-semibold tracking-tight sm:text-4xl">{value}</p>
      <p className="text-[var(--text-secondary)] mt-1 text-xs">{sub}</p>
    </div>
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 pb-16 sm:px-6 sm:py-14">
      <header className="mb-10 text-left">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">Site Insights</h1>
            <p className="text-[var(--text-secondary)] mt-1 max-w-xl text-sm leading-relaxed">
              jameymcelveen.com analytics — built in-house. No third-party page analytics required to tell this story.
            </p>
          </div>
          <p className="text-accent font-mono text-xs tracking-wide">
            Live · Updated every 60s
            {summary?.updatedAt ? (
              <span className="text-[var(--text-muted)] block text-[10px] font-normal">
                Last fetch {new Date(summary.updatedAt).toLocaleTimeString()}
              </span>
            ) : null}
          </p>
        </div>
      </header>

      {!connected ? (
        <div
          className="glass-card mb-8 rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
          style={{ willChange: 'transform' }}
        >
          <strong className="font-medium">Database not connected.</strong> Set{' '}
          <code className="font-mono text-xs">DATABASE_URL</code> on the host and run{' '}
          <code className="font-mono text-xs">migrations/001_analytics_events.sql</code>. Until then, counts stay at
          zero — the UI is the portfolio piece.
        </div>
      ) : null}

      {error ? (
        <p className="text-red-300 mb-6 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total visits"
          value={nf.format(summary?.stats.totalVisits ?? 0)}
          sub="All time · page views"
        />
        <StatCard
          label="Ask Jamey chats"
          value={nf.format(summary?.stats.askJameyChats ?? 0)}
          sub="All time · questions sent"
        />
        <StatCard
          label="Countries"
          value={nf.format(summary?.stats.countries ?? 0)}
          sub="Reached · from IP → country"
        />
        <StatCard
          label="Resume views"
          value={nf.format(summary?.stats.resumeViews ?? 0)}
          sub="Views + PDF downloads"
        />
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <VisitorMap countryCounts={summary?.countryCounts ?? []} />
        <div
          className="glass-card rounded-[var(--radius-card)] border border-[var(--glass-border)] p-4 sm:p-6"
          style={{ willChange: 'transform' }}
        >
          <h2 className="text-[var(--text-muted)] mb-4 font-mono text-[10px] tracking-[0.22em] uppercase">
            Top Ask Jamey questions
          </h2>
          <ul className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {(questions?.items.length ? questions.items : []).map((row, i) => (
              <li
                key={`${row.question}-${i}`}
                className="border-b border-[var(--glass-border)] pb-3 last:border-0 last:pb-0"
              >
                <p className="text-foreground text-sm leading-snug">&ldquo;{row.question}&rdquo;</p>
                <p className="text-[var(--text-muted)] mt-1 font-mono text-xs">{nf.format(row.count)}×</p>
              </li>
            ))}
            {!questions?.items.length ? (
              <li className="text-[var(--text-muted)] text-sm">No questions recorded yet.</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section
        className="glass-card mb-10 rounded-[var(--radius-card)] border border-[var(--glass-border)] p-4 sm:p-6"
        style={{ willChange: 'transform' }}
      >
        <h2 className="text-[var(--text-muted)] mb-4 font-mono text-[10px] tracking-[0.22em] uppercase">
          Visits per day · last 30 days
        </h2>
        <div className="h-[240px] w-full min-h-[220px] min-w-0 sm:h-[260px]">
          {chartReady ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.timeline ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                  tickFormatter={(v) => String(v).slice(5)}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} width={32} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,20,35,0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#e6edf3' }}
                  itemStyle={{ color: '#4ec9b0' }}
                />
                <Line type="monotone" dataKey="visits" stroke="var(--accent-blue)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="bg-foreground/5 h-full w-full animate-pulse rounded-lg" aria-hidden />
          )}
        </div>
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <div
          className="glass-card rounded-[var(--radius-card)] border border-[var(--glass-border)] p-4 sm:p-6"
          style={{ willChange: 'transform' }}
        >
          <h2 className="text-[var(--text-muted)] mb-4 font-mono text-[10px] tracking-[0.22em] uppercase">Top pages</h2>
          <ul className="space-y-2">
            {(summary?.topPages.length ? summary.topPages : []).map((row) => (
              <li key={row.path} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground truncate font-mono">{row.path}</span>
                <span className="text-[var(--text-muted)] shrink-0 font-mono text-xs">{nf.format(row.views)}</span>
              </li>
            ))}
            {!summary?.topPages.length ? (
              <li className="text-[var(--text-muted)] text-sm">No page views yet.</li>
            ) : null}
          </ul>
        </div>
        <div
          className="glass-card rounded-[var(--radius-card)] border border-[var(--glass-border)] p-4 sm:p-6"
          style={{ willChange: 'transform' }}
        >
          <h2 className="text-[var(--text-muted)] mb-4 font-mono text-[10px] tracking-[0.22em] uppercase">
            Traffic sources
          </h2>
          <ul className="space-y-2">
            {(summary?.trafficSources.length ? summary.trafficSources : []).map((row) => (
              <li key={row.source} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground truncate">{trafficLabel(row.source)}</span>
                <span className="text-[var(--text-muted)] shrink-0 font-mono text-xs">
                  {row.percent}% · {nf.format(row.count)}
                </span>
              </li>
            ))}
            {!summary?.trafficSources.length ? (
              <li className="text-[var(--text-muted)] text-sm">No referrer data yet.</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section
        className="glass-card rounded-[var(--radius-card)] border border-[var(--glass-border)] p-4 sm:p-6"
        style={{ willChange: 'transform' }}
      >
        <h2 className="text-[var(--text-muted)] mb-4 font-mono text-[10px] tracking-[0.22em] uppercase">
          Recent Ask Jamey questions
        </h2>
        <ul className="divide-y divide-[var(--glass-border)]">
          {(feed?.items.length ? feed.items : []).map((row, i) => (
            <li key={`${row.createdAt}-${i}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4">
              <span className="text-[var(--text-muted)] w-28 shrink-0 font-mono text-xs">{formatAgo(row.createdAt)}</span>
              <span className="text-foreground text-sm leading-relaxed">&ldquo;{row.question}&rdquo;</span>
            </li>
          ))}
          {!feed?.items.length ? (
            <li className="text-[var(--text-muted)] py-4 text-sm">No recent questions yet.</li>
          ) : null}
        </ul>
      </section>

      <footer className="text-[var(--text-muted)] mt-12 max-w-3xl border-t border-[var(--glass-border)] pt-8 text-center text-xs leading-relaxed sm:text-left">
        <strong className="text-[var(--text-secondary)]">Privacy:</strong> We collect approximate location (country /
        region from IP on the server — raw IP is not stored), page paths, referrers (hostname only), device class
        (mobile/desktop), Ask Jamey questions, starter chip clicks, and resume activity. This pipeline does not set
        cookies. No cross-site tracking.
        <span className="mt-3 block text-[10px]">
          Starter chip clicks (all time): {nf.format(summary?.stats.chipClicks ?? 0)}
        </span>
      </footer>
    </div>
  );
}
