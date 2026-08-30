import type { BoardHit, BoardPayload } from './types';

const FORBIDDEN_PROFILES = new Set(['seth', 'slater', 'connie']);

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function asWhy(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((line): line is string => typeof line === 'string');
}

export function freshnessFromWhy(why: string[]): string | null {
  const line = why.find((entry) => entry.startsWith('freshness '));
  if (!line) return null;
  const colon = line.indexOf(':');
  const label = colon >= 0 ? line.slice(colon + 1).trim() : '';
  return label || null;
}

export function isRemoteFromWhy(why: string[]): boolean {
  const line = why.find((entry) => entry.startsWith('remote '));
  if (!line) return false;
  if (/\bhybrid\b|\bunclear\b/i.test(line)) return false;
  return /\bremote-first\b|\bremote\b/i.test(line);
}

export function displayComp(comp: unknown): string | null {
  const value = asString(comp).trim();
  if (!value || value.toLowerCase() === 'not stated') return null;
  return value;
}

export function parseJameyBacklog(raw: unknown): BoardPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('jobscan payload is not an object');
  }

  const doc = raw as Record<string, unknown>;
  const profile = asString(doc.profile).trim().toLowerCase();

  if (FORBIDDEN_PROFILES.has(profile)) {
    throw new Error('rejected non-jamey profile');
  }
  if (profile !== 'jamey') {
    throw new Error('rejected non-jamey profile');
  }

  const hitsIn = Array.isArray(doc.hits) ? doc.hits : [];
  const hits: BoardHit[] = hitsIn
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const hit = row as Record<string, unknown>;
      const why = asWhy(hit.why);
      const id = asString(hit.id).trim();
      const title = asString(hit.title).trim();
      const url = asString(hit.url).trim();
      if (!id || !title || !url) return null;
      return {
        id,
        score: asNumber(hit.score),
        title,
        company: asString(hit.company).trim() || 'Unknown company',
        url,
        comp: displayComp(hit.comp),
        remote: isRemoteFromWhy(why),
        freshness: freshnessFromWhy(why),
        source: asString(hit.source).trim() || 'source',
      };
    })
    .filter((hit): hit is BoardHit => hit !== null)
    .sort((a, b) => b.score - a.score);

  return {
    profile: 'jamey',
    generated: asString(doc.generated) || new Date().toISOString(),
    hits,
  };
}

export function formatLastScan(fetchedAt: Date | string | null): string {
  if (!fetchedAt) return 'Last scan: none yet';
  const date = typeof fetchedAt === 'string' ? new Date(fetchedAt) : fetchedAt;
  if (Number.isNaN(date.getTime())) return 'Last scan: unknown';
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  return `Last scan: ${time} ET`;
}

export function isSameNyDate(fetchedAt: Date, now = new Date()): boolean {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(fetchedAt) === fmt.format(now);
}
