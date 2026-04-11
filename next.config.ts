import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

/** Interview.Api on Railway — same paths as this site (`/api/*`). Override via `INTERVIEW_API_PROXY_ORIGIN` (e.g. `http://api:8080` in Docker). */
const DEFAULT_API_UPSTREAM = 'https://mxv9j0bl.up.railway.app';
const API_UPSTREAM = (process.env.INTERVIEW_API_PROXY_ORIGIN ?? '').replace(/\/+$/, '') || DEFAULT_API_UPSTREAM;

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
