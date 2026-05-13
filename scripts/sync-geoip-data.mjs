/**
 * Copies geoip-lite binary data into vendor/geoip-data/ as real files (no symlinks).
 * pnpm keeps node_modules/geoip-lite as a symlink; Next output tracing + Vercel
 * then rejects serverless bundles that reference symlinked trees.
 *
 * Runs on postinstall and before production build (see package.json).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'vendor', 'geoip-data');

const REQUIRED = [
  'geoip-city.dat',
  'geoip-city6.dat',
  'geoip-city-names.dat',
  'geoip-country.dat',
  'geoip-country6.dat',
];

function resolveSrcDir() {
  const pkg = require.resolve('geoip-lite/package.json');
  return join(dirname(pkg), 'data');
}

function needsSync(src) {
  if (!existsSync(src)) {
    console.warn('[geoip-sync] Source data dir missing:', src);
    return false;
  }
  for (const name of REQUIRED) {
    const sp = join(src, name);
    const dp = join(dest, name);
    if (!existsSync(sp)) continue;
    if (!existsSync(dp)) return true;
    try {
      if (statSync(sp).size !== statSync(dp).size) return true;
    } catch {
      return true;
    }
  }
  return false;
}

function main() {
  let src;
  try {
    src = resolveSrcDir();
  } catch (e) {
    console.warn('[geoip-sync] Skip — geoip-lite not installed:', e);
    return;
  }

  if (!existsSync(src)) {
    console.warn('[geoip-sync] Skip — no data dir at', src);
    return;
  }

  if (!needsSync(src)) {
    console.log('[geoip-sync] Up to date —', dest.replace(root + '/', ''));
    return;
  }

  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true, dereference: true, force: true });
  const n = existsSync(dest) ? readdirSync(dest).length : 0;
  console.log('[geoip-sync] Copied', n, 'files → vendor/geoip-data');
}

main();
