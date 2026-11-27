import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';

/** One blog post, read from a Markdown file in src/content/blog. */
export type BlogPost = {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  html: string;
  minutes: number;
  draft: boolean;
  /** Optional header image, a site path such as /blog/name.png. Also used for link previews. */
  image?: string;
  /** Optional dark-mode version of the header image, shown when the page is dark. */
  imageDark?: string;
};

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'blog');
const FILE_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const FRONT_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Posts are Jamey's own files, but raw HTML is still dropped so a stray tag cannot break the page.
const md = new Marked({ gfm: true, renderer: { html: () => '' } });

function toDateString(value: unknown, fallback: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  return fallback;
}

/** A local site path such as /blog/a.png; anything else (outside links) is ignored. */
function sitePath(value: unknown): string | undefined {
  return typeof value === 'string' && /^\/[\w./-]+$/.test(value.trim()) ? value.trim() : undefined;
}

/** Parse one post file. Returns null when the name or the header is not valid. */
export function parsePost(fileName: string, raw: string): BlogPost | null {
  const name = FILE_RE.exec(fileName);
  const parts = FRONT_RE.exec(raw);
  if (!name || !parts) return null;

  let front: Record<string, unknown>;
  try {
    const parsed: unknown = parseYaml(parts[1]);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    front = parsed as Record<string, unknown>;
  } catch {
    return null;
  }

  const title = typeof front.title === 'string' ? front.title.trim() : '';
  if (!title) return null;

  const body = parts[2].trim();
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug: name[2],
    title,
    date: toDateString(front.date, name[1]),
    summary: typeof front.summary === 'string' ? front.summary.trim() : '',
    html: md.parse(body, { async: false }),
    minutes: Math.max(1, Math.round(words / 220)),
    draft: front.draft === true,
    image: sitePath(front.image),
    imageDark: sitePath(front.image_dark),
  };
}

/** Newest first. Drafts are left out. */
export function sortPosts(posts: BlogPost[]): BlogPost[] {
  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? 1 : -1));
}

export function getAllPosts(dir: string = POSTS_DIR): BlogPost[] {
  if (!fs.existsSync(dir)) return [];
  const posts: BlogPost[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!FILE_RE.test(file)) continue;
    const post = parsePost(file, fs.readFileSync(path.join(dir, file), 'utf8'));
    if (post) posts.push(post);
  }
  return sortPosts(posts);
}

export function getPost(slug: string, dir: string = POSTS_DIR): BlogPost | null {
  return getAllPosts(dir).find((p) => p.slug === slug) ?? null;
}

/** "November 26, 2026". Built from the parts so the time zone cannot shift the day. */
export function formatPostDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
