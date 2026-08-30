import 'server-only';

import type { PoolClient } from 'pg';
import { getAnalyticsPool } from '@/lib/api/analytics-events-db';
import { formatComp } from '@/lib/scanner/comp';
import { evaluate } from '@/lib/scanner/filter';
import { persistBoardJobs } from '@/lib/scanner/persist';
import { postingId, type Posting } from '@/lib/scanner/posting';
import { JAMEY_PROFILE } from '@/lib/scanner/profile';
import { score, weakestWhy } from '@/lib/scanner/score';
import type { LinkedInClip } from './linkedin-clip';
import { clipHitBody } from './markdown';
import { parseBoardHit } from './parse';
import type { BoardHit, BoardPayload } from './types';

export function clipToBoardHit(clip: LinkedInClip): BoardHit {
  const posting: Posting = {
    source: 'linkedin',
    company: clip.company,
    title: clip.title,
    url: clip.url,
    location: clip.location,
    body: clip.body,
    postedAt: clip.clippedAt ? new Date(clip.clippedAt) : null,
    domain: 'saas',
    compRaw: clip.comp ?? '',
  };

  const v = evaluate(posting);
  const cut = JAMEY_PROFILE.thresholds.backlogMinScore;
  if (!v.passed) {
    return {
      id: postingId(posting),
      score: 0,
      title: clip.title,
      company: clip.company,
      url: clip.url,
      comp: formatComp(v.comp) ?? clip.comp,
      remote: clip.remote,
      freshness: null,
      source: 'linkedin',
      nearMiss: true,
      deduction: v.reason,
      location: clip.location || null,
      body: clipHitBody(clip.body),
      why: [v.reason],
    };
  }

  const s = score(posting, v);
  const nearMiss = s.total < cut;
  const whyRemote = s.why.find((line) => line.startsWith('remote ')) ?? '';
  const whyFresh = s.why.find((line) => line.startsWith('freshness ')) ?? '';
  return {
    id: postingId(posting),
    score: s.total,
    title: clip.title,
    company: clip.company,
    url: clip.url,
    comp: formatComp(v.comp) ?? clip.comp,
    remote: /remote-first|\bremote\b/.test(whyRemote) && !/hybrid|unclear/.test(whyRemote),
    freshness: whyFresh.includes(':') ? whyFresh.slice(whyFresh.indexOf(':') + 1).trim() : null,
    source: 'linkedin',
    nearMiss,
    deduction: nearMiss ? weakestWhy(s.why) : null,
    location: clip.location || null,
    body: clipHitBody(clip.body),
    why: s.why,
  };
}

export async function loadLinkedInHitsFromDb(client?: PoolClient | null): Promise<BoardHit[]> {
  const runner = client ?? getAnalyticsPool();
  if (!runner) return [];
  try {
    const result = await runner.query<{ payload: unknown }>(
      `SELECT payload FROM board_jobs WHERE source = 'linkedin'`
    );
    return result.rows
      .map((row) => parseBoardHit(row.payload))
      .filter((hit): hit is BoardHit => hit !== null);
  } catch {
    return [];
  }
}

export function mergeLinkedInHits(payload: BoardPayload, linkedinHits: BoardHit[]): BoardPayload {
  const others = payload.hits.filter((hit) => hit.source !== 'linkedin');
  const taken = new Set(others.map((hit) => hit.url));
  const extra = linkedinHits.filter((hit) => !taken.has(hit.url));
  const hits = [...others, ...extra].sort((a, b) => b.score - a.score);
  return { ...payload, hits };
}

export async function mergeLinkedInIntoPayload(
  payload: BoardPayload,
  client?: PoolClient | null
): Promise<BoardPayload> {
  return mergeLinkedInHits(payload, await loadLinkedInHitsFromDb(client));
}

export async function ingestLinkedInClips(
  clips: LinkedInClip[],
  client?: PoolClient | null
): Promise<BoardHit[]> {
  const hits = clips.map(clipToBoardHit);
  await persistBoardJobs(hits, client);
  return hits;
}
