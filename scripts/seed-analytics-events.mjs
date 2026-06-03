/**
 * Seed analytics_events for local / staging dashboard demos.
 *
 *   DATABASE_URL=postgres://... pnpm run db:seed
 *   pnpm run db:seed -- --reset    # remove prior seed rows, then insert
 *   pnpm run db:seed -- --count=400
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SEED_MARKER = '__seed__';
const DEFAULT_COUNT = 320;

const PAGES = [
  { path: '/', weight: 38 },
  { path: '/resume', weight: 22 },
  { path: '/ai', weight: 14 },
  { path: '/dashboard', weight: 8 },
  { path: '/cover-letters', weight: 7 },
  { path: '/components', weight: 5 },
  { path: '/interview', weight: 4 },
  { path: '/stats', weight: 2 },
];

const REFERRERS = [
  { source: null, weight: 42 },
  { source: 'google.com', weight: 28 },
  { source: 'www.linkedin.com', weight: 14 },
  { source: 'github.com', weight: 8 },
  { source: 'bing.com', weight: 4 },
  { source: 'news.ycombinator.com', weight: 2 },
  { source: 't.co', weight: 2 },
];

const US_REGIONS = [
  'SC',
  'CA',
  'NY',
  'TX',
  'WA',
  'GA',
  'NC',
  'VA',
  'FL',
  'CO',
  'MA',
  'IL',
  'OH',
  'PA',
  'MI',
  'OR',
  'AZ',
  'TN',
  'MD',
  'MN',
  'WI',
  'MO',
  'NJ',
  'CT',
  'UT',
];

const INTL = [
  { country: 'CA', region: 'ON' },
  { country: 'CA', region: 'BC' },
  { country: 'GB', region: 'ENG' },
  { country: 'DE', region: 'BE' },
  { country: 'FR', region: 'IDF' },
  { country: 'IN', region: 'KA' },
  { country: 'BR', region: 'SP' },
  { country: 'AU', region: 'NSW' },
  { country: 'NL', region: 'NH' },
  { country: 'SE', region: 'AB' },
  { country: 'JP', region: '13' },
  { country: 'IE', region: 'L' },
];

const QUESTIONS = [
  'Walk me through your career',
  'Tell me about your HIPAA experience',
  'What are you currently building?',
  'How do you use AI in your workflow?',
  'Describe your experience with .NET and cloud architecture',
  'What is your approach to leading engineering teams?',
  'Have you worked with healthcare compliance before?',
  'What projects are on your GitHub right now?',
  'How do you handle legacy system modernization?',
  'Tell me about the Wiley book you wrote',
  'What is your experience with PostgreSQL at scale?',
  'How do you balance speed and quality in delivery?',
  'Describe a difficult production incident you resolved',
  'What is your remote work setup like?',
  'Are you open to contract engagements?',
];

const CHIPS = [
  'Walk me through your career',
  'Tell me about your HIPAA experience',
  'What are you currently building?',
  'How do you use AI in your workflow?',
];

function parseArgs(argv) {
  let reset = false;
  let count = DEFAULT_COUNT;
  for (const arg of argv) {
    if (arg === '--reset') reset = true;
    else if (arg.startsWith('--count=')) {
      const n = Number.parseInt(arg.slice('--count='.length), 10);
      if (Number.isFinite(n) && n > 0) count = n;
    }
  }
  return { reset, count };
}

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickGeo() {
  if (Math.random() < 0.84) {
    return { country: 'US', region: pick(US_REGIONS) };
  }
  return pick(INTL);
}

/** Bias toward recent days so the 30-day chart looks alive. */
function randomCreatedAt(maxDaysBack = 28) {
  const now = Date.now();
  const day = Math.floor(Math.pow(Math.random(), 1.35) * maxDaysBack);
  const ms =
    day * 86_400_000 +
    Math.floor(Math.random() * 86_400_000) -
    Math.floor(Math.random() * 3_600_000);
  return new Date(now - ms);
}

function buildRows(total) {
  const pageViews = Math.round(total * 0.68);
  const chats = Math.round(total * 0.14);
  const chips = Math.round(total * 0.08);
  const resumes = total - pageViews - chats - chips;

  const rows = [];

  for (let i = 0; i < pageViews; i++) {
    const geo = pickGeo();
    const ref = pickWeighted(REFERRERS);
    rows.push({
      eventType: 'page_view',
      page: pickWeighted(PAGES).path,
      question: null,
      chipLabel: null,
      country: geo.country,
      region: geo.region,
      referrer: ref.source,
      device: Math.random() < 0.22 ? 'mobile' : 'desktop',
      chatDurationSec: null,
      fromPage: SEED_MARKER,
      createdAt: randomCreatedAt(),
    });
  }

  for (let i = 0; i < chats; i++) {
    const geo = pickGeo();
    rows.push({
      eventType: 'ask_jamey_question',
      page: Math.random() < 0.7 ? '/ai' : pickWeighted(PAGES).path,
      question: pick(QUESTIONS),
      chipLabel: null,
      country: geo.country,
      region: geo.region,
      referrer: null,
      device: Math.random() < 0.18 ? 'mobile' : 'desktop',
      chatDurationSec: 8 + Math.floor(Math.random() * 240),
      fromPage: SEED_MARKER,
      createdAt: randomCreatedAt(),
    });
  }

  for (let i = 0; i < chips; i++) {
    const geo = pickGeo();
    rows.push({
      eventType: 'chip_click',
      page: Math.random() < 0.65 ? '/ai' : '/',
      question: null,
      chipLabel: pick(CHIPS),
      country: geo.country,
      region: geo.region,
      referrer: null,
      device: Math.random() < 0.2 ? 'mobile' : 'desktop',
      chatDurationSec: null,
      fromPage: SEED_MARKER,
      createdAt: randomCreatedAt(),
    });
  }

  const resumeTypes = ['resume_view', 'resume_preview', 'resume_download', 'resume_print'];
  for (let i = 0; i < resumes; i++) {
    const geo = pickGeo();
    rows.push({
      eventType: pick(resumeTypes),
      page: '/resume',
      question: null,
      chipLabel: null,
      country: geo.country,
      region: geo.region,
      referrer: Math.random() < 0.5 ? 'google.com' : null,
      device: Math.random() < 0.25 ? 'mobile' : 'desktop',
      chatDurationSec: null,
      fromPage: SEED_MARKER,
      createdAt: randomCreatedAt(),
    });
  }

  return rows;
}

async function main() {
  const { reset, count } = parseArgs(process.argv.slice(2));
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('[db:seed] DATABASE_URL is not set.');
    process.exit(1);
  }

  const migrationSql = readFileSync(join(root, 'migrations', '001_analytics_events.sql'), 'utf8');
  const pool = new pg.Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 25_000,
  });

  try {
    await pool.query(migrationSql);

    if (reset) {
      const del = await pool.query(`DELETE FROM analytics_events WHERE from_page = $1`, [SEED_MARKER]);
      console.log(`[db:seed] Cleared ${del.rowCount ?? 0} prior seed row(s).`);
    }

    const rows = buildRows(count);
    const chunkSize = 80;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const values = [];
      const params = [];
      let p = 1;

      for (const row of chunk) {
        values.push(
          `($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++})`
        );
        params.push(
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
          row.createdAt
        );
      }

      await pool.query(
        `INSERT INTO analytics_events
          (event_type, page, question, chip_label, country, region, referrer, device, chat_duration_sec, from_page, created_at)
         VALUES ${values.join(', ')}`,
        params
      );
      inserted += chunk.length;
    }

    const summary = await pool.query(
      `SELECT event_type, COUNT(*)::int AS c
         FROM analytics_events
        WHERE from_page = $1
        GROUP BY event_type
        ORDER BY event_type`,
      [SEED_MARKER]
    );

    console.log(`[db:seed] Inserted ${inserted} event(s) (target ${count}).`);
    console.log('[db:seed] Seed breakdown:', Object.fromEntries(summary.rows.map((r) => [r.event_type, r.c])));
    console.log('[db:seed] Re-run with --reset to replace seed data only.');
  } catch (e) {
    console.error('[db:seed] Failed:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

await main();
