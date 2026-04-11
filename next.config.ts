import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

/**
 * Interview.Api — same paths as this site (`/api/*`). Set `INTERVIEW_API_PROXY_ORIGIN` on Vercel (build-time)
 * to the service URL from Railway → your API → Settings → Networking (e.g. `https://….up.railway.app`).
 * Do not commit a default: Railway URLs change when services are recreated.
 */
const fromEnv = (process.env.INTERVIEW_API_PROXY_ORIGIN ?? '').replace(/\/+$/, '');
const isVercel = process.env.VERCEL === '1';
const API_UPSTREAM = fromEnv || (!isVercel ? 'http://127.0.0.1:8080' : '');
if (!API_UPSTREAM) {
  throw new Error(
    'INTERVIEW_API_PROXY_ORIGIN is required on Vercel. Set it to your Interview.Api origin (no trailing slash), then redeploy.'
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
