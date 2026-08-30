import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MERGED = path.join(ROOT, 'data', 'linkedin-clips.json');

function readEnv(name) {
  if (process.env[name]?.trim()) return process.env[name].trim();
  for (const file of ['.env.local', '.env']) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    const match = new RegExp(`^${name}=(.*)$`, 'm').exec(fs.readFileSync(full, 'utf8'));
    if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

const merged = fs.existsSync(MERGED) ? JSON.parse(fs.readFileSync(MERGED, 'utf8')) : { clips: [] };
const clips = Array.isArray(merged.clips) ? merged.clips : [];
if (clips.length === 0) {
  console.error('No clips to push. Run make linkedin-import after clipping a job.');
  process.exit(1);
}

const key = readEnv('BOARD_ADMIN_KEY');
if (!key) {
  console.error('BOARD_ADMIN_KEY missing in .env.local');
  process.exit(1);
}

const origin = (readEnv('BOARD_ORIGIN') || 'https://jameymcelveen.com').replace(/\/$/, '');
const response = await fetch(`${origin}/api/the-board/clips`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': key,
  },
  body: JSON.stringify({ clips }),
});
const body = await response.text();
if (!response.ok) {
  console.error(response.status, body);
  process.exit(1);
}
console.log(body);
