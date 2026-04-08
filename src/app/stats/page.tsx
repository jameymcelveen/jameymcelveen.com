import type { Metadata } from 'next';
import type { StatsDashboardData } from './StatsDashboard';
import { StatsDashboard } from './StatsDashboard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const revalidate = 30;

function serverApiBase(): string {
  const a = process.env.INTERVIEW_API_URL?.trim();
  if (a) return a.replace(/\/+$/, '');
  const b = process.env.NEXT_PUBLIC_API_URL?.trim();
  return b ? b.replace(/\/+$/, '') : '';
}

export default async function StatsPage() {
  const base = serverApiBase();
  const key = process.env.STATS_API_KEY?.trim();

  if (!base || !key) {
    return (
      <div className="glass-card border-accent/35 text-foreground-muted mx-auto mt-24 max-w-xl rounded-xl border p-6 font-mono text-sm">
        <h1 className="text-foreground mb-3 text-lg font-semibold">Stats dashboard</h1>
        <p className="mb-3">
          Configure server-side env for this Next.js deployment:{' '}
          <span className="text-foreground">INTERVIEW_API_URL</span> (or <span className="text-foreground">NEXT_PUBLIC_API_URL</span>)
          and <span className="text-foreground">STATS_API_KEY</span>. The key must match{' '}
          <span className="text-foreground">STATS_API_KEY</span> / <span className="text-foreground">Stats:ApiKey</span> on the
          Interview API.
        </p>
        <p className="text-foreground-muted/80">
          Open <span className="text-accent">/stats</span> after setting variables and redeploying.
        </p>
      </div>
    );
  }

  const res = await fetch(`${base}/api/stats`, {
    headers: { 'X-Stats-Key': key },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    return (
      <div className="glass-card border-accent/35 text-foreground-muted mx-auto mt-24 max-w-xl rounded-xl border p-6 font-mono text-sm">
        <h1 className="text-foreground mb-2 text-lg font-semibold">Stats unavailable</h1>
        <p>
          The API returned HTTP {res.status}. Check that STATS_API_KEY matches the API and that the database migration has run.
        </p>
      </div>
    );
  }

  const data = (await res.json()) as StatsDashboardData;
  return <StatsDashboard data={data} />;
}
