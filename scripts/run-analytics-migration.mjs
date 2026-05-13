/**
 * Runs on Vercel build when DATABASE_URL is set (see package.json "build").
 * Idempotent: migration uses IF NOT EXISTS.
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sqlPath = join(root, 'migrations', '001_analytics_events.sql');

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log('[db:migrate] Skipping — DATABASE_URL not set.');
    process.exit(0);
  }

  const sql = readFileSync(sqlPath, 'utf8');
  const pool = new pg.Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 25_000,
  });

  try {
    await pool.query(sql);
    console.log('[db:migrate] OK —', sqlPath.replace(root + '/', ''));
  } catch (e) {
    console.error('[db:migrate] Failed:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

await main();
