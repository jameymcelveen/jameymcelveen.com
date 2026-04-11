import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

function normalizeProxyOrigin(raw: string): string {
  const t = raw.trim().replace(/\/+$/, '');
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

const fromEnv = normalizeProxyOrigin(process.env.INTERVIEW_API_PROXY_ORIGIN ?? '');
const isVercel = process.env.VERCEL === '1';
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const useLocalApiFallback = !isVercel && !onRailway;
const API_UPSTREAM = fromEnv || (useLocalApiFallback ? 'http://127.0.0.1:8080' : '');
if (!API_UPSTREAM) {
  throw new Error(
    'INTERVIEW_API_PROXY_ORIGIN is required when deploying Next.js (Vercel or Railway). Set it to your API base URL.'
  );
}

/**
 * Sends www → apex (bare domain). In Vercel → Project → Domains, set the apex
 * as the primary production domain and point www at the same project so both
 * hostnames are valid. Do **not** leave “redirect apex → www” enabled there; if
 * Vercel and this rule disagree, you get ERR_TOO_MANY_REDIRECTS.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_UPSTREAM}/api/:path*` }];
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
