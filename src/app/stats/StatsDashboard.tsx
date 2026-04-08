'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type StatsDashboardData = {
  gemini: {
    totalEstimatedUsd: number;
    totalTurns: number;
    successfulTurns: number;
    avgCostPerTurnUsd: number;
    avgCostPerAiSessionUsd: number;
    totalPromptTokens: number;
    totalOutputTokens: number;
  };
  visits: {
    totalSessions: number;
    totalPageViews: number;
    avgSessionDurationSeconds: number | null;
    topPaths: { path: string; views: number }[];
    topReferrers: { referrerHost: string; sessions: number }[];
  };
  recentChats: {
    createdAtUtc: string;
    userMessage: string;
    estimatedCostUsd: number;
    httpStatus: number;
    promptTokens: number | null;
    outputTokens: number | null;
  }[];
  last14Days: {
    day: string;
    pageViews: number;
    sessions: number;
    geminiUsd: number;
  }[];
};

const usd = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 6 });

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card border-glass-border rounded-xl border p-4 sm:p-5">
      <h2 className="text-foreground mb-4 font-mono text-sm font-semibold tracking-wide uppercase">{title}</h2>
      {children}
    </div>
  );
}

export function StatsDashboard({ data }: { data: StatsDashboardData }) {
  const { gemini, visits, recentChats, last14Days } = data;
  const meterMax = Math.max(1, Number(gemini.totalEstimatedUsd) * 1.33, 5);
  const meterPct = Math.min(100, (Number(gemini.totalEstimatedUsd) / meterMax) * 100);

  const trendData = last14Days.map((d) => ({
    ...d,
    geminiUsd: Number(d.geminiUsd),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-accent mb-2 font-mono text-xs tracking-[0.2em] uppercase">Hidden route</p>
        <h1 className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Stats</h1>
        <p className="text-foreground-muted mx-auto mt-3 max-w-xl text-sm sm:text-base">
          Visit analytics and estimated Gemini usage. Estimates use{' '}
          <span className="text-foreground">appsettings.json</span> price-per-million tokens; adjust to match your
          Google AI billing tier.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card border-accent/30 rounded-xl border p-4">
          <p className="text-foreground-muted font-mono text-xs uppercase">Estimated Gemini spend</p>
          <p className="text-accent-highlight mt-1 font-mono text-2xl font-semibold">{usd.format(gemini.totalEstimatedUsd)}</p>
          <div className="bg-glass-border mt-3 h-2 overflow-hidden rounded-full">
            <div
              className="from-accent to-accent-secondary h-full rounded-full bg-gradient-to-r"
              style={{ width: `${meterPct}%` }}
            />
          </div>
          <p className="text-foreground-muted mt-2 font-mono text-xs">Scale max ≈ {usd.format(meterMax)} (visual only)</p>
        </div>
        <div className="glass-card border-glass-border rounded-xl border p-4">
          <p className="text-foreground-muted font-mono text-xs uppercase">Avg / successful turn</p>
          <p className="text-foreground mt-1 font-mono text-2xl font-semibold">{usd.format(gemini.avgCostPerTurnUsd)}</p>
          <p className="text-foreground-muted mt-1 font-mono text-xs">
            {gemini.successfulTurns} ok · {gemini.totalTurns} total turns
          </p>
        </div>
        <div className="glass-card border-glass-border rounded-xl border p-4">
          <p className="text-foreground-muted font-mono text-xs uppercase">Avg / AI session</p>
          <p className="text-foreground mt-1 font-mono text-2xl font-semibold">{usd.format(gemini.avgCostPerAiSessionUsd)}</p>
          <p className="text-foreground-muted mt-1 font-mono text-xs">Sessions with ≥1 successful reply</p>
        </div>
        <div className="glass-card border-glass-border rounded-xl border p-4">
          <p className="text-foreground-muted font-mono text-xs uppercase">Tokens (ok turns)</p>
          <p className="text-foreground mt-1 font-mono text-lg font-semibold">
            in {gemini.totalPromptTokens.toLocaleString()} · out {gemini.totalOutputTokens.toLocaleString()}
          </p>
          <p className="text-foreground-muted mt-1 font-mono text-xs">
            {visits.totalSessions} sessions · {visits.totalPageViews} page views
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Last 14 days — traffic & spend">
          <div className="text-foreground-muted font-mono mb-2 text-xs">
            Avg session dwell (tracked pages):{' '}
            {visits.avgSessionDurationSeconds === null
              ? '—'
              : `${Math.round(visits.avgSessionDurationSeconds)}s`}
          </div>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(12, 10, 16, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#f0f0f2' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="pageViews" name="Page views" stroke="#8b6cb5" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="sessions" name="Sessions" stroke="#f56600" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="geminiUsd" name="Gemini USD" stroke="#522d80" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top paths">
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visits.topPaths} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis type="category" dataKey="path" width={120} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(12, 10, 16, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="views" name="Views" fill="#8b6cb5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top referrers (host)">
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visits.topReferrers} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="referrerHost" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(12, 10, 16, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="sessions" name="Sessions" fill="#f56600" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Recent AI questions">
          <div className="max-h-80 overflow-auto rounded-lg border border-glass-border">
            <table className="w-full text-left font-mono text-xs sm:text-sm">
              <thead className="bg-glass-bg sticky top-0 text-foreground-muted">
                <tr>
                  <th className="px-3 py-2">When (UTC)</th>
                  <th className="px-3 py-2">HTTP</th>
                  <th className="px-3 py-2">Cost</th>
                  <th className="px-3 py-2">Question</th>
                </tr>
              </thead>
              <tbody className="divide-foreground-muted/15 text-foreground divide-y">
                {recentChats.map((row, i) => (
                  <tr key={`${row.createdAtUtc}-${i}`} className="align-top">
                    <td className="text-foreground-muted whitespace-nowrap px-3 py-2">
                      {new Date(row.createdAtUtc).toISOString().slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="px-3 py-2">{row.httpStatus}</td>
                    <td className="whitespace-nowrap px-3 py-2">{usd.format(row.estimatedCostUsd)}</td>
                    <td className="text-foreground-muted max-w-md px-3 py-2 break-words whitespace-normal">
                      {row.userMessage.length > 220 ? `${row.userMessage.slice(0, 220)}…` : row.userMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
