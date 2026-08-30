import 'server-only';

import type { PoolClient } from 'pg';
import { getAnalyticsPool } from '@/lib/api/analytics-events-db';
import type { BoardHit } from '@/lib/the-board/types';

export async function persistBoardJobs(hits: BoardHit[], client?: PoolClient | null): Promise<void> {
  const runner = client ?? getAnalyticsPool();
  if (!runner) return;

  for (const hit of hits) {
    await runner.query(
      `INSERT INTO board_jobs (id, url, company, title, source, score, near_miss, deduction, first_seen, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9::jsonb)
       ON CONFLICT (url) DO UPDATE SET
         id = EXCLUDED.id,
         company = EXCLUDED.company,
         title = EXCLUDED.title,
         source = EXCLUDED.source,
         score = EXCLUDED.score,
         near_miss = EXCLUDED.near_miss,
         deduction = EXCLUDED.deduction,
         payload = EXCLUDED.payload`,
      [
        hit.id,
        hit.url,
        hit.company,
        hit.title,
        hit.source,
        hit.score,
        hit.nearMiss,
        hit.deduction,
        JSON.stringify(hit),
      ]
    );
  }
}
