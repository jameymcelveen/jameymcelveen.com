import type { NextConfig } from 'next';
import type { Redirect } from 'next/dist/lib/load-custom-routes';
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

  async redirects(): Promise<Redirect[]> {
    const { domain } = profileData.site;
    const list: Redirect[] = [
      { source: '/resume/print', destination: '/resume/index.html', permanent: false },
      { source: '/book', destination: 'https://a.co/d/0bzHt9QF', permanent: false },
      { source: '/bobiverse', destination: '/bobiverse/index.html', permanent: false },
    ];

    if (domain.www && domain.canonical && domain.www !== domain.canonical) {
      list.unshift({
        source: '/:path*',
        has: [{ type: 'host', value: domain.www }],
        destination: `https://${domain.canonical}/:path*`,
        permanent: true,
      });
    }

    return list;
  },
};

export default nextConfig;
