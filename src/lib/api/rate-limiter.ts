const MAX_REQUESTS_PER_HOUR = 10;

const counters = new Map<string, { count: number; expiresAt: number }>();

function utcHourKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}${String(now.getUTCHours()).padStart(2, '0')}`;
}

function nextHourMs(): number {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 1));
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

export function checkRateLimit(ip: string): {
  allowed: boolean;
  limit: number;
  remaining: number;
} {
  const key = `chat-rl:${ip}:${utcHourKey()}`;
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
    allowed: entry.count <= MAX_REQUESTS_PER_HOUR,
    limit: MAX_REQUESTS_PER_HOUR,
    remaining: Math.max(0, MAX_REQUESTS_PER_HOUR - entry.count),
  };
}
