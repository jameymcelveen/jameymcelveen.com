import { NextResponse } from 'next/server';
import { adminKeyMatches } from '@/lib/the-board/admin';
import { readBoardCache, withBoardLock, writeBoardCache } from '@/lib/the-board/cache';
import { fetchJameyBacklog } from '@/lib/the-board/jobscan';
import { formatLastScan } from '@/lib/the-board/parse';
import { BOARD_REFRESH_MIN_MS } from '@/lib/the-board/constants';
import type { BoardViewModel } from '@/lib/the-board/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function asView(
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

export async function POST(request: Request) {
  const key = request.headers.get('x-admin-key');
  if (!adminKeyMatches(key)) {
    return NextResponse.json({ error: 'refresh is owner-only' }, { status: 401 });
  }

  return withBoardLock(async (client) => {
    const cached = await readBoardCache(client ?? undefined);
    if (cached && Date.now() - cached.fetchedAt.getTime() < BOARD_REFRESH_MIN_MS) {
      return NextResponse.json(
        {
          error: 'refresh is limited to once per 10 minutes',
          board: asView(cached.payload.hits, cached.fetchedAt, false, false),
        },
        { status: 429 }
      );
    }

    try {
      const payload = await fetchJameyBacklog();
      const fetchedAt = await writeBoardCache(payload, client ?? undefined);
      return NextResponse.json({ board: asView(payload.hits, fetchedAt, false, false) });
    } catch {
      if (cached) {
        return NextResponse.json({
          board: asView(cached.payload.hits, cached.fetchedAt, true, true),
          error: 'scanner unreachable, showing last good scan',
        });
      }
      return NextResponse.json(
        { error: 'Scanner unreachable and no prior scan is on file.' },
        { status: 502 }
      );
    }
  });
}
