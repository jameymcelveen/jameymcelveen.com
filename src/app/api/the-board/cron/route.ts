import { NextResponse } from 'next/server';
import { persistBoardJobs } from '@/lib/scanner/persist';
import { runJameyScan } from '@/lib/scanner/run-scan';
import { withBoardLock, writeBoardCache } from '@/lib/the-board/cache';
import { mergeLinkedInIntoPayload } from '@/lib/the-board/linkedin-hit';
import { viewFromPayload } from '@/lib/the-board/parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return true;
  if (request.headers.get('x-vercel-cron') === '1') return true;
  return false;
}

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return withBoardLock(async (client) => {
    const report = await runJameyScan();
    await persistBoardJobs(report.payload.hits, client);
    const payload = await mergeLinkedInIntoPayload(report.payload, client);
    const fetchedAt = await writeBoardCache(payload, client ?? undefined);
    return NextResponse.json({
      ok: true,
      board: viewFromPayload(payload, fetchedAt),
      fetched: report.fetched,
      displayed: report.displayed,
      nearMisses: report.nearMisses,
      rejected: report.rejected,
    });
  });
}
