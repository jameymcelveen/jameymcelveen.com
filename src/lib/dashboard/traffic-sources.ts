export type TrafficRow = { source: string; count: number; percent: number };
export type TrafficGroup = { label: string; count: number; percent: number };

const HOST_LABELS: [RegExp, string][] = [
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)github\.com$/, 'GitHub'],
  [/(^|\.)whatsapp\.com$|^wa\.me$/, 'WhatsApp'],
  [/(^|\.)facebook\.com$|^fb\.com$|^l\.facebook\.com$/, 'Facebook'],
  [/(^|\.)(twitter|x)\.com$|^t\.co$/, 'X / Twitter'],
  [/(^|\.)reddit\.com$/, 'Reddit'],
  [/(^|\.)claude\.ai$|(^|\.)anthropic\.com$/, 'Claude'],
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, 'ChatGPT'],
  [/(^|\.)mail\.google\.com$|(^|\.)outlook\.(live|office)\.com$/, 'Email'],
];

/** Friendly name for a stored referrer (hostname only, "tag:<campaign>", or "(direct)"). */
export function trafficLabel(source: string): string {
  const raw = source.trim();
  const s = raw.toLowerCase();
  if (!s || s === '(direct)') return 'Direct';
  if (s.startsWith('tag:')) return `Link: ${raw.slice(4)}`;
  for (const [re, label] of HOST_LABELS) if (re.test(s)) return label;
  const host = s.replace(/^www\./, '');
  return host.length > 28 ? `${host.slice(0, 26)}...` : host;
}

/**
 * Merge rows that share a label (web.whatsapp.com + wa.me, google.com + google.co.uk),
 * sort descending, keep the top `max` and fold the rest into "Other".
 */
export function groupTrafficSources(rows: TrafficRow[], max = 7): TrafficGroup[] {
  const total = rows.reduce((s, r) => s + r.count, 0);
  if (total <= 0) return [];
  const merged = new Map<string, number>();
  for (const r of rows) {
    const label = trafficLabel(r.source);
    merged.set(label, (merged.get(label) ?? 0) + r.count);
  }
  const sorted = [...merged.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, max);
  const rest = sorted.slice(max).reduce((s, [, c]) => s + c, 0);
  if (rest > 0) head.push(['Other', rest]);
  return head.map(([label, count]) => ({
    label,
    count,
    percent: Math.round((count / total) * 1000) / 10,
  }));
}
