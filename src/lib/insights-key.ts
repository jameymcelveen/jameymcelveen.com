/** The Insights password is kept for this browser tab only (sessionStorage), never localStorage. */
const KEY = 'jm-insights';
const EVENT = 'jm-insights-change';

export function readInsightsKey(): string {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveInsightsKey(value: string) {
  try {
    if (value) sessionStorage.setItem(KEY, value);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* private mode: works until reload */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** For useSyncExternalStore: re-read the key when it changes in this tab. */
export function subscribeInsightsKey(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function insightsHeaders(key: string): HeadersInit {
  return { Authorization: `Bearer ${key}` };
}
