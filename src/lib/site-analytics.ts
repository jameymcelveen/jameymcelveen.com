export const ANALYTICS_VISITOR_KEY = 'jm_analytics_vid';
export const ANALYTICS_SESSION_KEY = 'jm_analytics_sid';

/** Same-origin `/api/*` (served by Next.js API routes). */
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

export type InsightClientEvent = {
  event:
    | 'page_view'
    | 'ask_jamey_question'
    | 'chip_click'
    | 'resume_view'
    | 'resume_download'
    | 'resume_print';
  page?: string | null;
  question?: string | null;
  chip_label?: string | null;
  referrer?: string | null;
  device?: 'mobile' | 'desktop' | null;
  chat_duration_sec?: number | null;
  from_page?: string | null;
};

/** Public insights pipeline — no cookies; server derives country from IP. */
export function postInsightEvent(payload: InsightClientEvent): void {
  const base = analyticsApiBase();
  if (!base || typeof window === 'undefined') return;
  const body = JSON.stringify(payload);
  void fetch(`${base}/api/analytics/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}
