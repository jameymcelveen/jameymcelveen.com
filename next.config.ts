import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

const nextConfig: NextConfig = {
  serverExternalPackages: ['geoip-lite', 'pg'],

  outputFileTracingIncludes: {
    '/api/chat': ['./src/lib/api/system-prompt.md'],
    '/api/health': ['./src/lib/api/system-prompt.md'],
    '/api/analytics/event': ['./node_modules/geoip-lite/data/**/*'],
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
