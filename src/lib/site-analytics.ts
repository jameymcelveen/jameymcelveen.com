export const ANALYTICS_VISITOR_KEY = 'jm_analytics_vid';
export const ANALYTICS_SESSION_KEY = 'jm_analytics_sid';

/** Same-origin `/api/*` (rewritten to Railway in next.config.ts). */
export function analyticsApiBase(): string {
  return '';
}

export function getOrCreateVisitorKey(): string {
  if (typeof window === 'undefined') return '';
  let k = localStorage.getItem(ANALYTICS_VISITOR_KEY);
  if (!k) {
    k = crypto.randomUUID();
    localStorage.setItem(ANALYTICS_VISITOR_KEY, k);
  }
  return k;
}

/** Per-tab session; survives refresh, cleared when the tab closes. */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let s = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
  if (!s) {
    s = crypto.randomUUID();
    sessionStorage.setItem(ANALYTICS_SESSION_KEY, s);
  }
  return s;
}

export function readAnalyticsIds(): { visitorKey: string | null; sessionId: string | null } {
  if (typeof window === 'undefined') return { visitorKey: null, sessionId: null };
  return {
    visitorKey: localStorage.getItem(ANALYTICS_VISITOR_KEY),
    sessionId: sessionStorage.getItem(ANALYTICS_SESSION_KEY),
  };
}
