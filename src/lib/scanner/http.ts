import 'server-only';

import { getAnalyticsPool } from '@/lib/api/analytics-events-db';

export const SCANNER_UA = 'jameymcelveen-board/1.0 (personal job search; +https://jameymcelveen.com)';
export const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export type FetchStat = {
  source: string;
  ok: boolean;
  count: number;
  cached: boolean;
  error?: string;
  blocked?: string;
};

function nyDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export async function getCached(cacheKey: string): Promise<string | null> {
  const pool = getAnalyticsPool();
  if (!pool) return null;
  try {
    const result = await pool.query<{ body: string }>(
      `SELECT body FROM board_source_cache
       WHERE cache_key = $1 AND fetched_on = $2::date`,
      [cacheKey, nyDate()]
    );
    return result.rows[0]?.body ?? null;
  } catch {
    return null;
  }
}

export async function putCached(cacheKey: string, body: string): Promise<void> {
  const pool = getAnalyticsPool();
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO board_source_cache (cache_key, fetched_on, body)
       VALUES ($1, $2::date, $3)
       ON CONFLICT (cache_key) DO UPDATE SET fetched_on = EXCLUDED.fetched_on, body = EXCLUDED.body`,
      [cacheKey, nyDate(), body]
    );
  } catch {
    /* ignore */
  }
}

export async function getText(
  url: string,
  options?: { timeoutMs?: number; userAgent?: string; cacheKey?: string }
): Promise<{ text: string | null; cached: boolean; error?: string }> {
  const cacheKey = options?.cacheKey ?? url;
  const cached = await getCached(cacheKey);
  if (cached) return { text: cached, cached: true };

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json, application/rss+xml, text/xml, */*',
        'User-Agent': options?.userAgent ?? SCANNER_UA,
      },
      signal: AbortSignal.timeout(options?.timeoutMs ?? 8_000),
    });
    if (!response.ok) {
      return { text: null, cached: false, error: `${response.status}` };
    }
    const text = await response.text();
    await putCached(cacheKey, text);
    return { text, cached: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'fetch failed';
    return { text: null, cached: false, error: message };
  }
}

export function jsonStr(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === 'string' ? v : '';
}

export function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function withinDays(posted: Date | null, days: number): boolean {
  if (!posted) return true;
  return Date.now() - posted.getTime() <= days * 86_400_000;
}
