import { NextResponse } from 'next/server';
import { adminKeyMatches } from '@/lib/the-board/admin';
import { readBoardCache, withBoardLock, writeBoardCache } from '@/lib/the-board/cache';
import { parseLinkedInClipList } from '@/lib/the-board/linkedin-clip';
import { ingestLinkedInClips, mergeLinkedInIntoPayload } from '@/lib/the-board/linkedin-hit';
import { viewFromPayload } from '@/lib/the-board/parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const key = request.headers.get('x-admin-key');
  if (!adminKeyMatches(key)) {
    return NextResponse.json({ error: 'clips are owner-only' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'body must be JSON' }, { status: 400 });
  }

  const clips = parseLinkedInClipList(raw);
  if (clips.length === 0) {
    return NextResponse.json({ error: 'no linkedin clips in body' }, { status: 400 });
  }

  return withBoardLock(async (client) => {
    const hits = await ingestLinkedInClips(clips, client);
    const cached = await readBoardCache(client ?? undefined);
    const base = cached?.payload ?? {
      profile: 'jamey' as const,
      generated: new Date().toISOString(),
      hits: [],
    };
    const payload = await mergeLinkedInIntoPayload(base, client);
    const fetchedAt = await writeBoardCache(payload, client ?? undefined);
    return NextResponse.json({
      ok: true,
      added: hits.length,
      hits: hits.map((hit) => ({ id: hit.id, title: hit.title, company: hit.company, score: hit.score })),
      board: viewFromPayload(payload, fetchedAt),
    });
  });
}
