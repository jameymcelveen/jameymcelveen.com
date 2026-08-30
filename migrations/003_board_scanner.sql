-- Local jamey scanner tables for /lab/the-board.
-- board_jobs: scored survivors and near-misses. board_source_cache: raw daily fetches.

CREATE TABLE IF NOT EXISTS board_jobs (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  score INTEGER NOT NULL,
  near_miss BOOLEAN NOT NULL DEFAULT FALSE,
  deduction TEXT,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_board_jobs_score ON board_jobs (score DESC);

CREATE TABLE IF NOT EXISTS board_source_cache (
  cache_key TEXT PRIMARY KEY,
  fetched_on DATE NOT NULL,
  body TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_board_source_cache_day ON board_source_cache (fetched_on);
