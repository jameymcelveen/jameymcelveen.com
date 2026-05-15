import { Pool } from 'pg';

function fillLast30Days(rows: { day: string; visits: number }[]): { day: string; visits: number }[] {
  const map = new Map(rows.map((r) => [r.day, r.visits]));
  const out: { day: string; visits: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    out.push({ day, visits: map.get(day) ?? 0 });
  }
  return out;
}

const globalForPool = globalThis as unknown as { analyticsPgPool?: Pool };

export function getAnalyticsPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!globalForPool.analyticsPgPool) {
    globalForPool.analyticsPgPool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8000,
    });
  }
  return globalForPool.analyticsPgPool;
}

export type InsightEventType =
  | 'page_view'
  | 'ask_jamey_question'
  | 'chip_click'
  | 'resume_view'
  | 'resume_download'
  | 'resume_print'
  | 'resume_preview';

export async function insertAnalyticsEvent(row: {
  eventType: InsightEventType;
  page: string | null;
  question: string | null;
  chipLabel: string | null;
  country: string | null;
  region: string | null;
  referrer: string | null;
  device: string | null;
  chatDurationSec: number | null;
  fromPage: string | null;
}): Promise<void> {
  const pool = getAnalyticsPool();
  if (!pool) throw new Error('DATABASE_URL not configured');
  await pool.query(
    `INSERT INTO analytics_events
      (event_type, page, question, chip_label, country, region, referrer, device, chat_duration_sec, from_page)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      row.eventType,
      row.page,
      row.question,
      row.chipLabel,
      row.country,
      row.region,
      row.referrer,
      row.device,
      row.chatDurationSec,
      row.fromPage,
    ]
  );
}

function mapCountryRows(rows: { country: string; c: string }[]) {
  return rows.map((row) => ({ country: row.country, count: Number(row.c) }));
}

export async function queryDashboardSummary(): Promise<{
  stats: {
    totalVisits: number;
    askJameyChats: number;
    chipClicks: number;
    countries: number;
    resumeViews: number;
  };
  timeline: { day: string; visits: number }[];
  topPages: { path: string; views: number }[];
  trafficSources: { source: string; count: number; percent: number }[];
  countryCounts: { country: string; count: number }[];
  database: { usedBytes: number; limitBytes: number } | null;
}> {
  const pool = getAnalyticsPool();
  if (!pool) {
    return {
      stats: { totalVisits: 0, askJameyChats: 0, chipClicks: 0, countries: 0, resumeViews: 0 },
      timeline: fillLast30Days([]),
      topPages: [],
      trafficSources: [],
      countryCounts: [],
      database: null,
    };
  }

  const limitBytes =
    Number.parseInt(process.env.ANALYTICS_DB_LIMIT_BYTES?.trim() ?? '', 10) > 0
      ? Number.parseInt(process.env.ANALYTICS_DB_LIMIT_BYTES!.trim(), 10)
      : 536_870_912; /* 0.5 GiB — Neon free */

  const [
    visits,
    chats,
    chips,
    countries,
    resumes,
    timeline,
    topPages,
    refAgg,
    countryAgg,
    dbSize,
  ] = await Promise.all([
    pool.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM analytics_events WHERE event_type = 'page_view'`),
    pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM analytics_events WHERE event_type = 'ask_jamey_question'`
    ),
    pool.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM analytics_events WHERE event_type = 'chip_click'`),
    pool.query<{ c: string }>(
      `SELECT COUNT(DISTINCT country)::text AS c FROM analytics_events WHERE country IS NOT NULL AND country <> ''`
    ),
    pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM analytics_events WHERE event_type IN ('resume_view','resume_download','resume_print','resume_preview')`
    ),
    pool.query<{ day: string; visits: string }>(
      `SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
              COUNT(*)::text AS visits
         FROM analytics_events
        WHERE event_type = 'page_view'
          AND created_at >= (NOW() AT TIME ZONE 'utc')::timestamptz - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1 ASC`
    ),
    pool.query<{ path: string; views: string }>(
      `SELECT COALESCE(page, '/') AS path, COUNT(*)::text AS views
         FROM analytics_events
        WHERE event_type = 'page_view'
        GROUP BY 1
        ORDER BY COUNT(*) DESC
        LIMIT 12`
    ),
    pool.query<{ source: string; c: string }>(
      `SELECT COALESCE(NULLIF(TRIM(referrer), ''), '(direct)') AS source, COUNT(*)::text AS c
         FROM analytics_events
        WHERE event_type = 'page_view'
        GROUP BY 1
        ORDER BY COUNT(*) DESC
        LIMIT 12`
    ),
    pool.query<{ country: string; c: string }>(
      `SELECT country, COUNT(*)::text AS c
         FROM analytics_events
        WHERE event_type = 'page_view' AND country IS NOT NULL
        GROUP BY country
        ORDER BY COUNT(*) DESC
        LIMIT 80`
    ),
    pool.query<{ b: string }>(`SELECT pg_database_size(current_database())::text AS b`),
  ]);

  const totalVisits = Number(visits.rows[0]?.c ?? 0);
  const refRows = refAgg.rows.map((r) => ({ source: r.source, count: Number(r.c) }));
  const refTotal = refRows.reduce((s, r) => s + r.count, 0) || 1;
  const trafficSources = refRows.map((r) => ({
    ...r,
    percent: Math.round((r.count / refTotal) * 1000) / 10,
  }));

  const usedBytes = Math.max(0, Number(dbSize.rows[0]?.b ?? 0));

  return {
    stats: {
      totalVisits,
      askJameyChats: Number(chats.rows[0]?.c ?? 0),
      chipClicks: Number(chips.rows[0]?.c ?? 0),
      countries: Number(countries.rows[0]?.c ?? 0),
      resumeViews: Number(resumes.rows[0]?.c ?? 0),
    },
    timeline: fillLast30Days(
      timeline.rows.map((row) => ({ day: row.day, visits: Number(row.visits) }))
    ),
    topPages: topPages.rows.map((row) => ({ path: row.path, views: Number(row.views) })),
    trafficSources,
    countryCounts: mapCountryRows(countryAgg.rows),
    database: { usedBytes, limitBytes },
  };
}

export async function queryTopQuestions(limit = 25): Promise<{ question: string; count: number }[]> {
  const pool = getAnalyticsPool();
  if (!pool) return [];
  const r = await pool.query<{ question: string; c: string }>(
    `SELECT question, COUNT(*)::text AS c
       FROM analytics_events
      WHERE event_type = 'ask_jamey_question' AND question IS NOT NULL AND TRIM(question) <> ''
      GROUP BY question
      ORDER BY COUNT(*) DESC
      LIMIT $1`,
    [limit]
  );
  return r.rows.map((row) => ({ question: row.question, count: Number(row.c) }));
}

export async function queryRecentQuestions(
  limit = 40
): Promise<{ question: string; createdAt: string; country: string | null }[]> {
  const pool = getAnalyticsPool();
  if (!pool) return [];
  const r = await pool.query<{ question: string; created_at: Date; country: string | null }>(
    `SELECT question, created_at, country
       FROM analytics_events
      WHERE event_type = 'ask_jamey_question' AND question IS NOT NULL AND TRIM(question) <> ''
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit]
  );
  return r.rows.map((row) => ({
    question: row.question,
    createdAt: row.created_at.toISOString(),
    country: row.country ? String(row.country).trim().toUpperCase().slice(0, 2) : null,
  }));
}
