import 'server-only';

import { readBoardCache, withBoardLock, writeBoardCache } from './cache';
import { fetchJameyBacklog } from './jobscan';
import { formatLastScan, isSameNyDate } from './parse';
import type { BoardViewModel } from './types';

export async function loadBoard(): Promise<BoardViewModel> {
  return withBoardLock(async () => {
    const cached = await readBoardCache();
    if (cached && isSameNyDate(cached.fetchedAt)) {
      return viewFromCache(cached.payload.hits, cached.fetchedAt, false, false);
    }

    try {
      const payload = await fetchJameyBacklog();
      const fetchedAt = await writeBoardCache(payload);
      return viewFromCache(payload.hits, fetchedAt, false, false);
    } catch {
      if (cached) {
        return viewFromCache(cached.payload.hits, cached.fetchedAt, true, true);
      }
      return {
        hits: [],
        fetchedAt: null,
        lastScanLabel: formatLastScan(null),
        stale: true,
        scannerUnreachable: true,
        empty: true,
        error: 'Scanner unreachable and no prior scan is on file.',
      };
    }
  });
}

function viewFromCache(
  hits: BoardViewModel['hits'],
  fetchedAt: Date,
  stale: boolean,
  scannerUnreachable: boolean
): BoardViewModel {
  return {
    hits,
    fetchedAt: fetchedAt.toISOString(),
    lastScanLabel: formatLastScan(fetchedAt),
    stale,
    scannerUnreachable,
    empty: hits.length === 0,
    error: null,
  };
}
