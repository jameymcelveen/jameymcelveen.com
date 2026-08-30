import { htmlToMarkdown, stripHtml, unwrapXmlCdata } from './html.ts';

export type RssItem = {
  title: string;
  url: string;
  body: string;
  company: string;
  location: string;
  postedAt: Date | null;
};

export function rssCacheKey(feedName: string): string {
  return `rss:${feedName}`;
}

export function parseRssItems(xml: string, feedName: string): RssItem[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  return items
    .map((m) => parseRssItem(m[1] ?? '', feedName))
    .filter((item): item is RssItem => Boolean(item));
}

export function findRssItem(xml: string, url: string, feedName: string): RssItem | null {
  const want = rssUrlKey(url);
  if (!want) return null;
  return parseRssItems(xml, feedName).find((item) => rssUrlKey(item.url) === want) ?? null;
}

export function rssUrlKey(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.protocol = 'https:';
    parsed.hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, '') || '';
    return `${parsed.hostname}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function parseRssItem(block: string, feedName: string): RssItem | null {
  const title = stripHtml(rssField(block, 'title'));
  const url = rssLink(block);
  if (!title || !url) return null;

  const html = rssField(block, 'content:encoded') || rssField(block, 'description');
  const body = htmlToMarkdown(html);
  const author = stripHtml(rssField(block, 'author') || rssField(block, 'dc:creator'));
  const byline = parseFeedByline(body);
  const company = author || byline.company || feedName;
  const location = byline.location;
  const postedAt = parseRssDate(stripHtml(rssField(block, 'pubDate')));

  return { title, url, body, company, location, postedAt };
}

function rssField(block: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hit = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)</${escaped}>`, 'i').exec(block);
  return unwrapXmlCdata(hit?.[1] ?? '').trim();
}

function rssLink(block: string): string {
  const fromTag = stripHtml(rssField(block, 'link'));
  if (fromTag) return fromTag;
  const href = /<link\b[^>]*href=["']([^"']+)["']/i.exec(block)?.[1];
  if (href) return href.trim();
  return stripHtml(rssField(block, 'guid'));
}

function parseFeedByline(body: string): { company: string; location: string } {
  const first = body.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
  const match = first.match(/^(.+?)\s+[\u2014\u2013-]\s+(.+)$/);
  if (!match) return { company: '', location: '' };
  const company = match[1]?.trim() ?? '';
  const location = match[2]?.trim() ?? '';
  if (!company || /^tags\b/i.test(company)) return { company: '', location: '' };
  return { company, location };
}

function parseRssDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
