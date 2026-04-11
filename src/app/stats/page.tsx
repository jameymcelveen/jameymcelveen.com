import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { StatsDashboardData } from './StatsDashboard';
import { StatsDashboard } from './StatsDashboard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const revalidate = 30;

/** Same-origin `/api/*` so the request hits Next rewrites → Railway. */
async function sameOriginBase(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = (h.get('x-forwarded-proto') ?? 'https').split(',')[0].trim();
  if (!host) return 'http://localhost:3000';
  return `${proto}://${host.split(',')[0].trim()}`;
}

export default async function StatsPage() {
  const key = process.env.STATS_API_KEY?.trim();

  if (!key) {
    return (
      <div className="glass-card border-accent/35 text-foreground-muted mx-auto mt-24 max-w-xl rounded-xl border p-6 font-mono text-sm">
        <h1 className="text-foreground mb-3 text-lg font-semibold">Stats dashboard</h1>
        <p className="mb-3">
          Set server-side <span className="text-foreground">STATS_API_KEY</span> for this Next.js deployment. It must match{' '}
          <span className="text-foreground">STATS_API_KEY</span> / <span className="text-foreground">Stats:ApiKey</span> on the
          Interview API.
        </p>
        <p className="text-foreground-muted/80">
          Open <span className="text-accent">/stats</span> after setting the variable and redeploying.
        </p>
      </div>
    );
  }

  const base = await sameOriginBase();
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
