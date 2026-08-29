const MAX_REQUESTS_PER_HOUR = 10;
const FIT_FILTER_MAX_PER_HOUR = 5;

const counters = new Map<string, { count: number; expiresAt: number }>();

function utcHourKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}${String(now.getUTCHours()).padStart(2, '0')}`;
}

function nextHourMs(): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 1)
  );
  return next.getTime();
}

export function resolveClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

export function checkRateLimit(
  ip: string,
  options?: { namespace?: string; maxPerHour?: number }
): {
  allowed: boolean;
  limit: number;
  remaining: number;
} {
  const namespace = options?.namespace ?? 'chat-rl';
  const maxPerHour = options?.maxPerHour ?? MAX_REQUESTS_PER_HOUR;
  const key = `${namespace}:${ip}:${utcHourKey()}`;
  const now = Date.now();

  let entry = counters.get(key);
  if (!entry || entry.expiresAt <= now) {
    entry = { count: 0, expiresAt: nextHourMs() };
    counters.set(key, entry);
  }

  entry.count++;

  // Prune expired entries periodically
  if (counters.size > 10_000) {
    for (const [k, v] of counters) {
      if (v.expiresAt <= now) counters.delete(k);
    }
  }

  return {
    allowed: entry.count <= maxPerHour,
    limit: maxPerHour,
    remaining: Math.max(0, maxPerHour - entry.count),
  };
}

export function checkFitFilterRateLimit(ip: string) {
  return checkRateLimit(ip, { namespace: 'fit-filter-rl', maxPerHour: FIT_FILTER_MAX_PER_HOUR });
}
