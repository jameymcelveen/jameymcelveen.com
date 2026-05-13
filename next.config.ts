import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

const nextConfig: NextConfig = {
  /** pg stays external; geoip-lite is bundled with data from vendor/ (see scripts/sync-geoip-data.mjs). */
  serverExternalPackages: ['pg'],

  outputFileTracingIncludes: {
    '/api/chat': ['./src/lib/api/system-prompt.md'],
    '/api/health': ['./src/lib/api/system-prompt.md'],
    /** Real files only — never trace pnpm’s symlinked node_modules/geoip-lite/data. */
    '/api/analytics/event': ['./vendor/geoip-data/**/*'],
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
