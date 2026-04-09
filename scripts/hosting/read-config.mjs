#!/usr/bin/env node
/**
 * Read scripts/hosting/config.yaml — used by shell wrappers (no secrets).
 * Usage:
 *   node read-config.mjs get vercel.project_name
 *   node read-config.mjs export-sh   # prints export KEY=value lines for bash eval
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, 'config.yaml');

function get(obj, pathStr) {
  return pathStr.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

const raw = readFileSync(configPath, 'utf8');
const cfg = parseYaml(raw);

const [, , mode, key] = process.argv;

if (mode === 'export-sh') {
  const proj = cfg.project_slug ?? cfg.vercel?.project_name ?? 'jameymcelveen';
  const apiUrl = cfg.api?.public_base_url ?? '';
  console.log(`export HOSTING_PROJECT_SLUG="${proj}"`);
  console.log(`export VERCEL_PROJECT_NAME="${cfg.vercel?.project_name ?? proj}"`);
  console.log(`export RAILWAY_PROJECT_NAME="${cfg.railway?.project_name ?? proj}"`);
  console.log(`export API_PUBLIC_BASE_URL="${apiUrl}"`);
  process.exit(0);
}

if (mode !== 'get' || !key) {
  console.error('Usage: node read-config.mjs get <dot.path> | node read-config.mjs export-sh');
  process.exit(1);
}

const val = get(cfg, key);
if (val === undefined || val === null) {
  process.exit(2);
}
if (typeof val === 'object') {
  console.log(JSON.stringify(val));
} else {
  console.log(String(val));
}
