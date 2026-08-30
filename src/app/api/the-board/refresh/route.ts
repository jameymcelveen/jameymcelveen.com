import { NextResponse } from 'next/server';
import { persistBoardJobs } from '@/lib/scanner/persist';
import { runJameyScan } from '@/lib/scanner/run-scan';
import { adminKeyMatches } from '@/lib/the-board/admin';
import { readBoardCache, withBoardLock, writeBoardCache } from '@/lib/the-board/cache';
import { BOARD_REFRESH_MIN_MS } from '@/lib/the-board/constants';
import { mergeLinkedInIntoPayload } from '@/lib/the-board/linkedin-hit';
import { viewFromPayload } from '@/lib/the-board/parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
          board: viewFromPayload(cached.payload, cached.fetchedAt),
        },
        { status: 429 }
      );
    }

    try {
      const report = await runJameyScan();
      await persistBoardJobs(report.payload.hits, client);
      const payload = await mergeLinkedInIntoPayload(report.payload, client);
      const fetchedAt = await writeBoardCache(payload, client ?? undefined);
      return NextResponse.json({
        board: viewFromPayload(payload, fetchedAt),
        report: {
          fetched: report.fetched,
          fetchedBySource: report.fetchedBySource.map((s) => ({
            source: s.source,
            ok: s.ok,
            count: s.count,
            cached: s.cached,
            blocked: s.blocked ?? null,
          })),
          rejected: report.rejected,
          rejectedByReason: report.rejectedByReason,
          scored: report.scored,
          displayed: report.displayed,
          nearMisses: report.nearMisses,
          blocked: report.blocked,
        },
      });
    } catch {
      if (cached) {
        return NextResponse.json({
          board: viewFromPayload(cached.payload, cached.fetchedAt, true),
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
