import 'server-only';

import { getAnalyticsPool } from '@/lib/api/analytics-events-db';
import { BOARD_CACHE_ID } from './constants';
import { parseJameyBacklog } from './parse';
import type { BoardPayload } from './types';

export type CacheRow = {
  fetchedAt: Date;
  payload: BoardPayload;
};

const ADVISORY_LOCK = 87241001;

export async function readBoardCache(): Promise<CacheRow | null> {
  const pool = getAnalyticsPool();
  if (!pool) return null;

  const result = await pool.query<{ fetched_at: Date; payload: unknown }>(
    'SELECT fetched_at, payload FROM job_board_cache WHERE id = $1',
    [BOARD_CACHE_ID]
  );
  const row = result.rows[0];
  if (!row) return null;

  try {
    return { fetchedAt: row.fetched_at, payload: parseJameyBacklog(row.payload) };
  } catch {
    return null;
  }
}

export async function writeBoardCache(payload: BoardPayload): Promise<Date> {
  const pool = getAnalyticsPool();
  if (!pool) return new Date();

  const result = await pool.query<{ fetched_at: Date }>(
    `INSERT INTO job_board_cache (id, fetched_at, payload)
     VALUES ($1, NOW(), $2::jsonb)
     ON CONFLICT (id) DO UPDATE SET fetched_at = NOW(), payload = EXCLUDED.payload
     RETURNING fetched_at`,
    [BOARD_CACHE_ID, JSON.stringify(payload)]
  );
  return result.rows[0]?.fetched_at ?? new Date();
}

export async function withBoardLock<T>(fn: () => Promise<T>): Promise<T> {
  const pool = getAnalyticsPool();
  if (!pool) return fn();

  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK]);
    return await fn();
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK]);
    } finally {
      client.release();
    }
  }
}
