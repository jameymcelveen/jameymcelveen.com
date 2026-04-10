import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

const proxyOrigin = process.env.INTERVIEW_API_PROXY_ORIGIN?.trim().replace(/\/+$/, '') ?? '';

/**
 * Sends www → apex (bare domain). In Vercel → Project → Domains, set the apex
 * as the primary production domain and point www at the same project so both
 * hostnames are valid. Do **not** leave “redirect apex → www” enabled there; if
 * Vercel and this rule disagree, you get ERR_TOO_MANY_REDIRECTS.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    if (!proxyOrigin) return [];
    return [{ source: '/api/:path*', destination: `${proxyOrigin}/api/:path*` }];
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
