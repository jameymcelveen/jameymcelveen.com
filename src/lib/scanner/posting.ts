import { createHash } from 'crypto';

export type Posting = {
  source: string;
  company: string;
  title: string;
  url: string;
  location: string;
  body: string;
  postedAt: Date | null;
  domain: string;
  compRaw: string;
};

export function postingId(p: Posting): string {
  const seed = `${p.company}|${p.title}|${p.url}`.toLowerCase();
  return createHash('sha1').update(seed).digest('hex').slice(0, 12);
}

export function haystack(p: Posting): string {
  return `${p.title}\n${p.location}\n${p.body}`.toLowerCase();
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gh_src'];
    for (const key of drop) parsed.searchParams.delete(key);
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}
