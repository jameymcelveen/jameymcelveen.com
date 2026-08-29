'use client';

import { Analytics } from '@vercel/analytics/next';

export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const path = new URL(event.url).pathname;
          if (path === '/lab' || path.startsWith('/lab/')) return null;
        } catch {
          if (event.url.includes('/lab/')) return null;
        }
        return event;
      }}
    />
  );
}
