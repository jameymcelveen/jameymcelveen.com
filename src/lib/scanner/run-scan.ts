import 'server-only';

import { formatComp } from './comp';
import { evaluate } from './filter';
import type { FetchStat } from './http';
import { normalizeTitle, normalizeUrl, postingId, type Posting } from './posting';
import { JAMEY_PROFILE, NEAR_MISS_BAND } from './profile';
import { score, weakestWhy } from './score';
import { fetchAllSources } from './sources';
import type { BoardHit, BoardPayload } from '@/lib/the-board/types';

export type ScanReject = { reason: string; count: number };

export type ScanReport = {
  fetched: number;
  fetchedBySource: FetchStat[];
  rejected: number;
  rejectedByReason: ScanReject[];
  scored: number;
  displayed: number;
  nearMisses: number;
  blocked: string[];
  payload: BoardPayload;
};

function reasonBucket(reason: string): string {
  const head = reason.split(':')[0]?.trim() ?? reason;
  return head;
}

function dedupe(postings: Posting[]): Posting[] {
  const byUrl = new Map<string, Posting>();
  const byPair = new Set<string>();
  const out: Posting[] = [];
  for (const p of postings) {
    if (!p.url || !p.title) continue;
    const url = normalizeUrl(p.url);
    if (byUrl.has(url)) continue;
    const pair = `${p.company.toLowerCase().trim()}|${normalizeTitle(p.title)}`;
    if (byPair.has(pair)) continue;
    byUrl.set(url, p);
    byPair.add(pair);
    out.push({ ...p, url });
  }
  return out;
}

export async function runJameyScan(): Promise<ScanReport> {
  const { postings: raw, stats } = await fetchAllSources();
  const postings = dedupe(raw);
  const rejectCounts = new Map<string, number>();
  const hits: BoardHit[] = [];
  let scored = 0;
  const cut = JAMEY_PROFILE.thresholds.backlogMinScore;
  const nearFloor = cut - NEAR_MISS_BAND;

  for (const p of postings) {
    const v = evaluate(p);
    if (!v.passed) {
      const bucket = reasonBucket(v.reason);
      rejectCounts.set(bucket, (rejectCounts.get(bucket) ?? 0) + 1);
      continue;
    }

    const s = score(p, v);
    scored += 1;
    if (s.total < nearFloor) {
      rejectCounts.set('score', (rejectCounts.get('score') ?? 0) + 1);
      continue;
    }

    const nearMiss = s.total < cut;
    const whyRemote = s.why.find((line) => line.startsWith('remote ')) ?? '';
    const whyFresh = s.why.find((line) => line.startsWith('freshness ')) ?? '';
    hits.push({
      id: postingId(p),
      score: s.total,
      title: p.title,
      company: p.company || 'Unknown company',
      url: p.url,
      comp: formatComp(v.comp),
      remote: /remote-first|\bremote\b/.test(whyRemote) && !/hybrid|unclear/.test(whyRemote),
      freshness: whyFresh.includes(':') ? whyFresh.slice(whyFresh.indexOf(':') + 1).trim() : null,
      source: p.source,
      nearMiss,
      deduction: nearMiss ? weakestWhy(s.why) : null,
    });
  }

  hits.sort((a, b) => b.score - a.score);
  const displayed = hits.filter((h) => !h.nearMiss).length;
  const nearMisses = hits.filter((h) => h.nearMiss).length;
  const blocked = [...new Set(stats.filter((s) => s.blocked).map((s) => s.blocked as string))];

  const rejected = [...rejectCounts.values()].reduce((a, b) => a + b, 0);
  const rejectedByReason = [...rejectCounts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  const payload: BoardPayload = {
    profile: 'jamey',
    generated: new Date().toISOString(),
    hits,
    stats: {
      fetched: postings.length,
      displayed,
      nearMisses,
      rejected,
    },
    sources: stats.map((s) => ({
      source: s.source,
      fetched: s.count,
      ok: s.ok,
      cached: s.cached,
      blocked: s.blocked ?? null,
      error: s.error ?? null,
    })),
    rejectedByReason,
  };

  return {
    fetched: postings.length,
    fetchedBySource: stats,
    rejected,
    rejectedByReason,
    scored,
    displayed,
    nearMisses,
    blocked,
    payload,
  };
}
