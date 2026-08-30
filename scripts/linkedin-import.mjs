import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = path.join(ROOT, 'data', 'linkedin-clips', 'inbox');
const MERGED = path.join(ROOT, 'data', 'linkedin-clips.json');
const DOWNLOADS = path.join(os.homedir(), 'Downloads');
const NAME = /^linkedin-clip-.*\.json$/i;

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function asClips(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.clips)) return raw.clips;
  if (raw.title && raw.url) return [raw];
  return [];
}

function jobUrl(url) {
  const match = /linkedin\.com\/jobs\/view\/(\d+)/i.exec(String(url ?? ''));
  return match?.[1] ? `https://www.linkedin.com/jobs/view/${match[1]}/` : String(url ?? '').trim();
}

fs.mkdirSync(INBOX, { recursive: true });

const files = [];
for (const dir of [INBOX, DOWNLOADS]) {
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (NAME.test(name)) files.push(path.join(dir, name));
  }
}

const byUrl = new Map();
const existing = asClips(readJson(MERGED));
for (const clip of existing) {
  const url = jobUrl(clip.url);
  if (url) byUrl.set(url, { ...clip, url });
}

for (const file of files) {
  for (const clip of asClips(readJson(file))) {
    const url = jobUrl(clip.url);
    if (!clip.title || !url) continue;
    byUrl.set(url, { ...clip, url, source: 'linkedin' });
  }
  const base = path.basename(file);
  const dest = path.join(INBOX, base);
  if (path.dirname(file) !== INBOX) {
    fs.copyFileSync(file, dest);
  }
}

const clips = [...byUrl.values()].sort((a, b) =>
  String(b.clippedAt ?? '').localeCompare(String(a.clippedAt ?? ''))
);
fs.writeFileSync(MERGED, `${JSON.stringify({ clips }, null, 2)}\n`);

const summary = {
  count: clips.length,
  files: files.map((file) => path.basename(file)),
  titles: clips.map((clip) => `${clip.company} — ${clip.title}`),
};
console.log(JSON.stringify(summary, null, 2));
if (clips.length === 0) {
  console.error('No linkedin-clip-*.json in Downloads or data/linkedin-clips/inbox');
  process.exitCode = 0;
}
