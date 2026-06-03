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
  llm: {
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
    llmUsd: number;
  }[];
};

const usd = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 6 });

const panel =
  'border-steel bg-surface rounded-md border p-4 sm:p-5 transition-colors hover:border-steel/80 sm:p-5';

function MetricCard({
  label,
  children,
  variant,
}: {
  label: string;
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'neutral';
}) {
  const border =
    variant === 'success'
      ? 'border-metric-success/45 ring-1 ring-metric-success/15'
      : variant === 'warning'
        ? 'border-metric-warning/55 ring-1 ring-metric-warning/20'
        : 'border-steel';

  return (
    <div className={`${panel} ${border}`}>
      <p
        className={`font-mono text-[10px] tracking-widest uppercase ${
          variant === 'success'
            ? 'text-metric-success'
            : variant === 'warning'
              ? 'text-metric-warning'
              : 'text-foreground-muted'
        }`}
      >
        {label}
      </p>
      <div
        className={`mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-[1.65rem] ${
          variant === 'success'
            ? 'text-metric-success'
            : variant === 'warning'
              ? 'text-metric-warning'
              : 'text-foreground'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={panel}>
      <h2 className="text-accent mb-4 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function StatsDashboard({ data }: { data: StatsDashboardData }) {
  const { llm, visits, recentChats, last14Days } = data;
  const trendData = last14Days.map((d) => ({
    ...d,
    llmUsd: Number(d.llmUsd),
  }));

  const gridShell =
    'relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-4 py-12 sm:px-6 sm:py-16';

  return (
    <div className={gridShell}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 border-b border-steel pb-8 sm:mb-12">
          <p className="text-metric-success mb-2 font-mono text-[10px] tracking-[0.25em] uppercase">
            Monitoring / internal
          </p>
          <h1 className="text-foreground font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
            Observability — traffic &amp; model usage
          </h1>
          <p className="text-foreground-muted mt-3 max-w-2xl font-mono text-xs leading-relaxed sm:text-sm">
            Estimates use API token pricing configuration. Visit and session counts are success-path signals;
            Ask Jamey (Claude) spend is flagged as a cost signal (amber).
          </p>
        </header>

        <div className="mb-8 grid gap-4 font-mono sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Sessions" variant="success">
            {visits.totalSessions.toLocaleString()}
          </MetricCard>
          <MetricCard label="Page views" variant="success">
            {visits.totalPageViews.toLocaleString()}
          </MetricCard>
          <MetricCard label="Avg dwell (tracked pages)" variant="success">
            {visits.avgSessionDurationSeconds === null
              ? '—'
              : `${Math.round(visits.avgSessionDurationSeconds)}s`}
          </MetricCard>
          <MetricCard label="Bill / Claude spend (est.)" variant="warning">
            {usd.format(llm.totalEstimatedUsd)}
          </MetricCard>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Avg / successful turn" variant="warning">
            {usd.format(llm.avgCostPerTurnUsd)}
          </MetricCard>
          <MetricCard label="Avg / AI session" variant="warning">
            {usd.format(llm.avgCostPerAiSessionUsd)}
          </MetricCard>
          <MetricCard label="Successful turns" variant="neutral">
            <span className="text-metric-success">{llm.successfulTurns}</span>
            <span className="text-foreground-muted text-lg"> / {llm.totalTurns}</span>
          </MetricCard>
          <div className={`${panel} border-steel`}>
            <p className="text-foreground-muted font-mono text-[10px] tracking-widest uppercase">Tokens (in / out)</p>
            <div className="mt-2 font-mono text-lg font-semibold tabular-nums tracking-tight sm:text-xl">
              <span className="text-metric-success">{llm.totalPromptTokens.toLocaleString()}</span>
              <span className="text-foreground-muted"> · </span>
              <span className="text-accent-csharp">{llm.totalOutputTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Last 14d — series">
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,51,59,0.9)" />
                  <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 17, 23, 0.96)',
                      border: '1px solid #2d333b',
                      borderRadius: 6,
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#e6edf3' }}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pageViews"
                    name="Page views"
                    stroke="#3fb950"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sessions"
                    name="Sessions"
                    stroke="#357ec7"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="llmUsd"
                    name="Claude USD"
                    stroke="#d4a72c"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Top paths">
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visits.topPaths} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,51,59,0.9)" />
                  <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis type="category" dataKey="path" width={120} tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 17, 23, 0.96)',
                      border: '1px solid #2d333b',
                      borderRadius: 6,
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="views" name="Views" fill="#3fb950" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Top referrers">
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visits.topReferrers} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,51,59,0.9)" />
                  <XAxis dataKey="referrerHost" tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'monospace' }} angle={-22} textAnchor="end" height={56} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 17, 23, 0.96)',
                      border: '1px solid #2d333b',
                      borderRadius: 6,
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="sessions" name="Sessions" fill="#357ec7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Recent prompts (log)">
            <div className="border-steel max-h-80 overflow-auto rounded-md border">
              <table className="font-mono w-full text-left text-[11px] tabular-nums sm:text-xs">
                <thead className="bg-background text-foreground-muted sticky top-0 border-b border-steel">
                  <tr>
                    <th className="px-3 py-2 font-medium">ts_utc</th>
                    <th className="px-3 py-2 font-medium">http</th>
                    <th className="px-3 py-2 font-medium text-metric-warning">cost_usd</th>
                    <th className="px-3 py-2 font-medium">message</th>
                  </tr>
                </thead>
                <tbody className="divide-foreground-muted/10 text-foreground divide-y">
                  {recentChats.map((row, i) => (
                    <tr key={`${row.createdAtUtc}-${i}`} className="align-top">
                      <td className="text-foreground-muted whitespace-nowrap px-3 py-2">
                        {new Date(row.createdAtUtc).toISOString().slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            row.httpStatus === 200 ? 'text-metric-success' : 'text-metric-warning'
                          }
                        >
                          {row.httpStatus}
                        </span>
                      </td>
                      <td className="text-metric-warning whitespace-nowrap px-3 py-2">
                        {usd.format(row.estimatedCostUsd)}
                      </td>
                      <td className="text-foreground-muted max-w-md px-3 py-2 wrap-break-word whitespace-normal">
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
    </div>
  );
}
