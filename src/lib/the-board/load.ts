import 'server-only';

import { readBoardCache } from './cache';
import { formatLastScan, viewFromPayload } from './parse';
import type { BoardViewModel } from './types';

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
