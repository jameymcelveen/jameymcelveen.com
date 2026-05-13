-- Run against your Railway PostgreSQL database (once).
-- psql $DATABASE_URL -f migrations/001_analytics_events.sql

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  page VARCHAR(255),
  question TEXT,
  chip_label VARCHAR(255),
  country CHAR(2),
  region VARCHAR(100),
  referrer VARCHAR(500),
  device VARCHAR(20),
  chat_duration_sec INTEGER,
  from_page VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics_events (country) WHERE country IS NOT NULL;
