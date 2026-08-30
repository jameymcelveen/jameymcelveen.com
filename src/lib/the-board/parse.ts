import type {
  BoardHit,
  BoardPayload,
  BoardReject,
  BoardScanStats,
  BoardSourceStat,
  BoardViewModel,
} from './types';

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
    .map((row) => parseBoardHit(row))
    .filter((hit): hit is BoardHit => hit !== null)
    .sort((a, b) => b.score - a.score);

  const stats = parseStats(doc.stats);
  const sources = parseSources(doc.sources);
  const rejectedByReason = parseRejects(doc.rejectedByReason);

  return {
    profile: 'jamey',
    generated: asString(doc.generated) || new Date().toISOString(),
    hits,
    ...(stats ? { stats } : {}),
    ...(sources.length ? { sources } : {}),
    ...(rejectedByReason.length ? { rejectedByReason } : {}),
  };
}

export function parseBoardHit(raw: unknown): BoardHit | null {
  if (!raw || typeof raw !== 'object') return null;
  const hit = raw as Record<string, unknown>;
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
    remote: typeof hit.remote === 'boolean' ? hit.remote : isRemoteFromWhy(why),
    freshness: asString(hit.freshness) || freshnessFromWhy(why),
    source: asString(hit.source).trim() || 'source',
    nearMiss: hit.nearMiss === true,
    deduction: asString(hit.deduction) || null,
    location: asString(hit.location).trim() || null,
    body: asString(hit.body).trim() || null,
    why,
  };
}

function parseStats(raw: unknown): BoardScanStats | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const row = raw as Record<string, unknown>;
  return {
    fetched: asNumber(row.fetched),
    displayed: asNumber(row.displayed),
    nearMisses: asNumber(row.nearMisses),
    rejected: asNumber(row.rejected),
  };
}

function parseSources(raw: unknown): BoardSourceStat[] {
  if (!Array.isArray(raw)) return [];
  const out: BoardSourceStat[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const source = asString(row.source).trim();
    if (!source) continue;
    const fetched = typeof row.fetched === 'number' ? row.fetched : asNumber(row.count);
    out.push({
      source,
      fetched,
      ok: row.ok !== false,
      cached: row.cached === true,
      blocked: asString(row.blocked) || null,
      error: asString(row.error) || null,
    });
  }
  return out.sort((a, b) => b.fetched - a.fetched || a.source.localeCompare(b.source));
}

function parseRejects(raw: unknown): BoardReject[] {
  if (!Array.isArray(raw)) return [];
  const out: BoardReject[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const reason = asString(row.reason).trim();
    if (!reason) continue;
    out.push({ reason, count: asNumber(row.count) });
  }
  return out.sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

export function sourcesFromHits(hits: BoardHit[]): BoardSourceStat[] {
  const map = new Map<string, number>();
  for (const hit of hits) {
    map.set(hit.source, (map.get(hit.source) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([source, fetched]) => ({
      source,
      fetched,
      ok: true,
      cached: false,
      blocked: null,
      error: null,
    }));
}

export function statsFromHits(hits: BoardHit[]): BoardScanStats {
  const displayed = hits.filter((hit) => !hit.nearMiss).length;
  return {
    fetched: hits.length,
    displayed,
    nearMisses: hits.length - displayed,
    rejected: 0,
  };
}

export function splitSourceLabel(source: string): { family: string; detail: string | null } {
  const colon = source.indexOf(':');
  if (colon <= 0) return { family: source, detail: null };
  return { family: source.slice(0, colon), detail: source.slice(colon + 1) };
}

export function viewFromPayload(
  payload: BoardPayload,
  fetchedAt: Date,
  stale = false
): BoardViewModel {
  const hasSources = Boolean(payload.sources?.length);
  return {
    hits: payload.hits,
    fetchedAt: fetchedAt.toISOString(),
    lastScanLabel: formatLastScan(fetchedAt),
    stale,
    scannerUnreachable: stale,
    empty: payload.hits.length === 0,
    error: null,
    stats: payload.stats ?? (payload.hits.length ? statsFromHits(payload.hits) : null),
    sources: hasSources ? payload.sources! : sourcesFromHits(payload.hits),
    sourceCountsFromHits: !hasSources,
    rejectedByReason: payload.rejectedByReason ?? [],
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
