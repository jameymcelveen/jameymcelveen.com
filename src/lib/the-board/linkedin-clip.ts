export type LinkedInClip = {
  clippedAt: string;
  title: string;
  company: string;
  url: string;
  location: string;
  comp: string | null;
  remote: boolean;
  body: string;
  source: 'linkedin';
};

export function normalizeLinkedInJobUrl(url: string): string {
  const match = /linkedin\.com\/jobs\/view\/(\d+)/i.exec(url);
  if (match?.[1]) return `https://www.linkedin.com/jobs/view/${match[1]}/`;
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function parseLinkedInClip(raw: unknown): LinkedInClip | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const title = asString(row.title);
  const url = normalizeLinkedInJobUrl(asString(row.url));
  if (!title || !url) return null;
  const body = asString(row.body);
  const location = asString(row.location);
  return {
    clippedAt: asString(row.clippedAt) || new Date().toISOString(),
    title,
    company: asString(row.company) || 'Unknown company',
    url,
    location,
    comp: asString(row.comp) || null,
    remote:
      typeof row.remote === 'boolean'
        ? row.remote
        : /\bremote\b/i.test(`${location}\n${body}`),
    body,
    source: 'linkedin',
  };
}

export function parseLinkedInClipList(raw: unknown): LinkedInClip[] {
  let rows: unknown[] = [];
  if (Array.isArray(raw)) rows = raw;
  else if (raw && typeof raw === 'object' && Array.isArray((raw as { clips?: unknown }).clips)) {
    rows = (raw as { clips: unknown[] }).clips;
  } else if (raw) rows = [raw];

  const byUrl = new Map<string, LinkedInClip>();
  for (const row of rows) {
    const clip = parseLinkedInClip(row);
    if (!clip) continue;
    byUrl.set(clip.url, clip);
  }
  return [...byUrl.values()].sort((a, b) => b.clippedAt.localeCompare(a.clippedAt));
}

export function clipToMarkdown(clip: LinkedInClip): string {
  const facts = [
    clip.comp ? `- Comp: ${clip.comp}` : null,
    clip.location ? `- Location: ${clip.location}` : null,
    `- Remote: ${clip.remote ? 'yes' : 'no'}`,
    `- Source: linkedin`,
  ].filter((line): line is string => Boolean(line));

  const parts = [
    `# ${clip.title}`,
    '',
    `**${clip.company}**`,
    '',
    ...facts,
    '',
    `[Original posting](${clip.url})`,
    '',
    '## Posting',
    '',
    clip.body || '_No description was visible on the LinkedIn page._',
  ];
  return `${parts.join('\n')}\n`;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
