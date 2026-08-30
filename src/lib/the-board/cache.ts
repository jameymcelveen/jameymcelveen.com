import 'server-only';

import type { PoolClient } from 'pg';
import { getAnalyticsPool } from '@/lib/api/analytics-events-db';
import { BOARD_CACHE_ID } from './constants';
import { parseJameyBacklog } from './parse';
import type { BoardPayload } from './types';

export type CacheRow = {
  fetchedAt: Date;
  payload: BoardPayload;
};

const ADVISORY_LOCK = 87241001;

function rowFrom(fetchedAt: Date, payload: unknown): CacheRow | null {
  try {
    return { fetchedAt, payload: parseJameyBacklog(payload) };
  } catch {
    return null;
  }
}

export async function readBoardCache(client?: PoolClient): Promise<CacheRow | null> {
  const runner = client ?? getAnalyticsPool();
  if (!runner) return null;

  try {
    const result = await runner.query<{ fetched_at: Date; payload: unknown }>(
      'SELECT fetched_at, payload FROM job_board_cache WHERE id = $1',
      [BOARD_CACHE_ID]
    );
    const row = result.rows[0];
    if (!row) return null;
    return rowFrom(row.fetched_at, row.payload);
  } catch {
    return null;
  }
}

export async function writeBoardCache(payload: BoardPayload, client?: PoolClient): Promise<Date> {
  const runner = client ?? getAnalyticsPool();
  if (!runner) return new Date();

  try {
    const result = await runner.query<{ fetched_at: Date }>(
      `INSERT INTO job_board_cache (id, fetched_at, payload)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (id) DO UPDATE SET fetched_at = NOW(), payload = EXCLUDED.payload
       RETURNING fetched_at`,
      [BOARD_CACHE_ID, JSON.stringify(payload)]
    );
    return result.rows[0]?.fetched_at ?? new Date();
  } catch {
    return new Date();
  }
}

/** One pooled client for lock + queries so we cannot exhaust the pool. */
export async function withBoardLock<T>(fn: (client: PoolClient | null) => Promise<T>): Promise<T> {
  const pool = getAnalyticsPool();
  if (!pool) return fn(null);

  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK]);
    return await fn(client);
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK]);
    } finally {
      client.release();
    }
  }
}
