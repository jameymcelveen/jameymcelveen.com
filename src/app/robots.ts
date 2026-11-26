import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/lab/',
        '/resume/print',
        '/dashboard',
        '/api/analytics',
        '/api/fit-filter',
        '/api/the-board',
        '/api/the-board/cron',
      ],
    },
  };
}
