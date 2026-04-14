import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

/**
 * Next.js rewrite `destination` must be absolute (`http://` / `https://`) or start with `/`.
 * Hostname-only values (e.g. `api.example.com`) get `https://` prepended.
 */
function normalizeProxyOrigin(raw: string): string {
  const t = raw.trim().replace(/\/+$/, '');
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

/**
 * Interview.Api — same paths as this site (`/api/*`). Set `INTERVIEW_API_PROXY_ORIGIN` on Vercel (build-time)
 * to your API origin, e.g. `https://api.example.com` or `api.example.com`.
 */
const fromEnv = normalizeProxyOrigin(process.env.INTERVIEW_API_PROXY_ORIGIN ?? '');
const isVercel = process.env.VERCEL === '1';
/** Railway injects these; localhost fallback must not run there or rewrites hit 127.0.0.1 inside the container. */
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const useLocalApiFallback = !isVercel && !onRailway;
const API_UPSTREAM = fromEnv || (useLocalApiFallback ? 'http://127.0.0.1:8080' : '');

// Warn at build time if the upstream is missing so it shows up in Vercel build logs,
// but don't throw — a missing var should not kill a preview deployment or branch build.
// The /api/* routes will simply return 404 until the env var is configured.
if (!API_UPSTREAM) {
  console.warn(
    '[next.config] INTERVIEW_API_PROXY_ORIGIN is not set. ' +
    '/api/* routes will not be proxied (chat will be unavailable). ' +
    'Set this env var in Vercel → Project Settings → Environment Variables ' +
    'to your Railway API base URL (e.g. https://api.jameymcelveen.com).'
  );
}

/**
 * Proxy `/api/*` to Railway. Query string is forwarded by Next/Vercel; headers pass through the edge proxy.
 * If INTERVIEW_API_PROXY_ORIGIN is unset the rewrite is skipped and /api/* returns 404.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    if (!API_UPSTREAM) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${API_UPSTREAM}/api/:path*`,
      },
    ];
  },

  async redirects() {
    const { domain } = profileData.site;

    if (domain.www && domain.canonical && domain.www !== domain.canonical) {
      return [
        {
          source: '/:path*',
          has: [{ type: 'host', value: domain.www }],
          destination: `https://${domain.canonical}/:path*`,
          permanent: true,
        },
      ];
    }

    return [];
  },
};

export default nextConfig;
