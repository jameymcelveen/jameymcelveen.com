import 'server-only';

import { JAMEY_BACKLOG_URL } from './constants';
import { parseJameyBacklog } from './parse';
import type { BoardPayload } from './types';

export async function fetchJameyBacklog(): Promise<BoardPayload> {
  const response = await fetch(JAMEY_BACKLOG_URL, {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`jobscan responded ${response.status}`);
  }

  const raw: unknown = await response.json();
  return parseJameyBacklog(raw);
}
