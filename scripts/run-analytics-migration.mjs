/**
 * Runs on Vercel build when DATABASE_URL is set (see package.json "build").
 * Idempotent: migrations use IF NOT EXISTS.
 */
import { readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const migrationsDir = join(root, 'migrations');

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log('[db:migrate] Skipping — DATABASE_URL not set.');
    process.exit(0);
  }

  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const pool = new pg.Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 25_000,
  });

  try {
    for (const file of files) {
      const sqlPath = join(migrationsDir, file);
      const sql = readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log('[db:migrate] OK —', `migrations/${file}`);
    }
  } catch (e) {
    console.error('[db:migrate] Failed:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

await main();
