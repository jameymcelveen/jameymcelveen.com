import type { NextConfig } from 'next';
import type { Redirect } from 'next/dist/lib/load-custom-routes';
import profileData from './src/data/profile.json';

const nextConfig: NextConfig = {
  /** pg stays external; geoip-lite is bundled with data from vendor/ (see scripts/sync-geoip-data.mjs). */
  serverExternalPackages: ['pg'],

  outputFileTracingIncludes: {
    '/api/chat': ['./src/lib/api/system-prompt.md', './src/lib/api/knowledge/*.md'],
    '/api/health': ['./src/lib/api/system-prompt.md', './src/lib/api/knowledge/*.md'],
    '/resume': ['./src/data/resume.yaml'],
    '/resume/print': ['./src/data/resume.yaml'],
    /** Real files only — never trace pnpm’s symlinked node_modules/geoip-lite/data. */
    '/api/analytics/event': ['./vendor/geoip-data/**/*'],
  },

  async redirects(): Promise<Redirect[]> {
    const { domain } = profileData.site;
    const list: Redirect[] = [
      { source: '/lab', destination: '/lab/board', permanent: false },
      { source: '/lab/the-board', destination: '/lab/board', permanent: true },
      { source: '/lab/the-search', destination: '/lab/search', permanent: true },
      { source: '/lab/the-board/jobs/:id', destination: '/lab/board/jobs/:id', permanent: true },
      { source: '/lab/the-board/sources', destination: '/lab/sources', permanent: true },
      { source: '/book', destination: 'https://a.co/d/0bzHt9QF', permanent: false },
      { source: '/bobiverse', destination: '/bobiverse/index.html', permanent: false },
      { source: '/belize-arch', destination: '/belize-arch/index.html', permanent: false },
      { source: '/3941-sardis-hwy', destination: '/3931-sardis-hwy', permanent: true },
      { source: '/3931-sardis-hwy', destination: '/3931-sardis-hwy/index.html', permanent: false },
      { source: '/floppy-fish', destination: '/floppy-fish/index.html', permanent: false },
      { source: '/boxscan', destination: 'https://github.com/jameymcelveen/boxscan', permanent: false },
      { source: '/cardscan', destination: 'https://github.com/jameymcelveen/boxscan', permanent: false },
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
