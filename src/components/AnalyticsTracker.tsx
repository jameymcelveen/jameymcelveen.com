'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  analyticsApiBase,
  ANALYTICS_SESSION_KEY,
  getOrCreateSessionId,
  getOrCreateVisitorKey,
  postInsightEvent,
} from '@/lib/site-analytics';

async function postJson(url: string, body: unknown) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const registerOnce = useRef<Promise<void> | null>(null);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const base = analyticsApiBase();
    if (!base || typeof window === 'undefined') return;

    const ensureSession = () => {
      if (registerOnce.current) return registerOnce.current;
      const sid = getOrCreateSessionId();
      const vid = getOrCreateVisitorKey();
      registerOnce.current = (async () => {
        await postJson(`${base}/api/analytics/session`, {
          sessionId: sid,
          visitorKey: vid,
          referrer: typeof document !== 'undefined' ? document.referrer || null : null,
          landingPath: pathname || '/',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          acceptLanguage: typeof navigator !== 'undefined' ? navigator.language : null,
          screenWidth: typeof screen !== 'undefined' ? screen.width : null,
          screenHeight: typeof screen !== 'undefined' ? screen.height : null,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      })();
      return registerOnce.current;
    };

    let cancelled = false;
    void (async () => {
      await ensureSession();
      if (cancelled) return;
      const sid = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
      if (!sid) return;
      await postJson(`${base}/api/analytics/pageview`, {
        sessionId: sid,
        path: pathname || '/',
        title: typeof document !== 'undefined' ? document.title : null,
      });

      const path = pathname || '/';
      const prev = lastPathRef.current;
      try {
        if (prev === null) {
          sessionStorage.removeItem('jm_resume_from');
        } else {
          sessionStorage.setItem('jm_resume_from', prev);
        }
      } catch {
        /* ignore */
      }
      lastPathRef.current = path;

      postInsightEvent({
        event: 'page_view',
        page: path,
        referrer: document.referrer || null,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const base = analyticsApiBase();
    if (!base || typeof window === 'undefined') return;

    const onLeave = () => {
      const sid = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
      if (!sid) return;
      void postJson(`${base}/api/analytics/session/end`, { sessionId: sid });
    };

    window.addEventListener('pagehide', onLeave);
    return () => window.removeEventListener('pagehide', onLeave);
  }, []);

  return null;
}
