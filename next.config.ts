import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

/**
 * `/api/*` → Railway: `app/api/[...path]/route.ts` (INTERVIEW_API_PROXY_ORIGIN).
 * www → apex: set apex as primary in Vercel; do not also redirect apex → www.
 */
const nextConfig: NextConfig = {
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
