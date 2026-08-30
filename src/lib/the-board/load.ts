import 'server-only';

import { getAnalyticsPool } from '@/lib/api/analytics-events-db';
import { readBoardCache } from './cache';
import { hydrateHitFromFeeds } from './hydrate';
import { formatLastScan, parseBoardHit, viewFromPayload } from './parse';
import type { BoardHit, BoardViewModel } from './types';

export async function loadBoard(): Promise<BoardViewModel> {
  const cached = await readBoardCache();
  if (cached) {
    return viewFromPayload(cached.payload, cached.fetchedAt);
  }
  return {
    hits: [],
    fetchedAt: null,
    lastScanLabel: formatLastScan(null),
    stale: false,
    scannerUnreachable: false,
    empty: true,
    error: null,
    stats: null,
    sources: [],
    sourceCountsFromHits: false,
    rejectedByReason: [],
  };
}

export async function loadBoardHit(id: string): Promise<BoardHit | null> {
  const board = await loadBoard();
  const live = board.hits.find((hit) => hit.id === id) ?? null;
  const stored = live ? null : await loadStoredHit(id);
  const hit = live ?? stored;
  if (!hit) return null;
  if (hit.body) return hit;

  const fromJobs = live ? await loadStoredHit(id) : null;
  if (fromJobs?.body) {
    return {
      ...hit,
      body: fromJobs.body,
      location: hit.location || fromJobs.location,
    };
  }

  return hydrateHitFromFeeds(hit);
}

async function loadStoredHit(id: string): Promise<BoardHit | null> {
  const pool = getAnalyticsPool();
  if (!pool) return null;
  try {
    const result = await pool.query<{ payload: unknown }>(
      'SELECT payload FROM board_jobs WHERE id = $1',
      [id]
    );
    return parseBoardHit(result.rows[0]?.payload);
  } catch {
    return null;
  }
}

