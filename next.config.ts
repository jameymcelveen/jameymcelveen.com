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
const API_UPSTREAM = fromEnv || (!isVercel ? 'http://127.0.0.1:8080' : '');
if (!API_UPSTREAM) {
  throw new Error(
    'INTERVIEW_API_PROXY_ORIGIN is required on Vercel. Set it to your Interview.Api host or URL (e.g. https://api.jameymcelveen.com), then redeploy.'
  );
}

/**
 * Proxy `/api/*` to Railway. Query string is forwarded by Next/Vercel; headers pass through the edge proxy.
 * (If you needed `/chat` on Railway instead of `/api/chat`, the destination would be `${origin}/:path*` — not this API.)
 */
const nextConfig: NextConfig = {
  async rewrites() {
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
