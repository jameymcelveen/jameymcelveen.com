-- Daily job-board cache for /lab/the-board (Jamey profile only).
-- Singleton row id = 1. Overwritten on each successful scan.

CREATE TABLE IF NOT EXISTS job_board_cache (
  id INTEGER PRIMARY KEY,
  fetched_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL
);
