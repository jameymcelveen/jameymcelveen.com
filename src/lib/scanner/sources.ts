import 'server-only';

import { stripHtml } from './html';
import { BROWSER_UA, getText, jsonStr, parseDate, withinDays, type FetchStat } from './http';
import { FRESHNESS_MAX_DAYS, SEARCH_QUERIES } from './profile';
import type { Posting } from './posting';
import { JAMEY_COMPANIES, JAMEY_FEEDS, type CompanyEntry } from './watchlist';

type SourceResult = { postings: Posting[]; stat: FetchStat };

function asObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

async function greenhouse(c: CompanyEntry): Promise<SourceResult> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${c.token}/jobs?content=true`;
  const { text, cached, error } = await getText(url, { cacheKey: `gh:${c.token}` });
  if (!text) {
    return { postings: [], stat: { source: `greenhouse:${c.name}`, ok: false, count: 0, cached, error } };
  }
  let jobs: unknown[] = [];
  try {
    const doc = JSON.parse(text) as { jobs?: unknown[] };
    jobs = Array.isArray(doc.jobs) ? doc.jobs : [];
  } catch {
    return { postings: [], stat: { source: `greenhouse:${c.name}`, ok: false, count: 0, cached, error: 'bad json' } };
  }
  const postings: Posting[] = [];
  for (const raw of jobs) {
    const j = asObj(raw);
    if (!j) continue;
    let comp = '';
    const meta = Array.isArray(j.metadata) ? j.metadata : [];
    for (const item of meta) {
      const m = asObj(item);
      if (!m) continue;
      const name = jsonStr(m, 'name').toLowerCase();
      if (name.includes('salary') || name.includes('compensation')) {
        const val = typeof m.value === 'string' ? m.value : '';
        comp += ` ${val}`;
      }
    }
    const loc = asObj(j.location);
    postings.push({
      source: 'greenhouse',
      company: c.name,
      title: jsonStr(j, 'title'),
      url: jsonStr(j, 'absolute_url'),
      location: loc ? jsonStr(loc, 'name') : '',
      body: stripHtml(jsonStr(j, 'content')),
      postedAt: parseDate(jsonStr(j, 'updated_at')) ?? parseDate(jsonStr(j, 'first_published')),
      domain: c.domain,
      compRaw: comp.trim(),
    });
  }
  return {
    postings,
    stat: { source: `greenhouse:${c.name}`, ok: true, count: postings.length, cached },
  };
}

async function lever(c: CompanyEntry): Promise<SourceResult> {
  const url = `https://api.lever.co/v0/postings/${c.token}?mode=json`;
  const { text, cached, error } = await getText(url, { cacheKey: `lever:${c.token}` });
  if (!text) {
    return { postings: [], stat: { source: `lever:${c.name}`, ok: false, count: 0, cached, error } };
  }
  let rows: unknown[] = [];
  try {
    const doc = JSON.parse(text) as unknown;
    rows = Array.isArray(doc) ? doc : [];
  } catch {
    return { postings: [], stat: { source: `lever:${c.name}`, ok: false, count: 0, cached, error: 'bad json' } };
  }
  const postings: Posting[] = [];
  for (const raw of rows) {
    const j = asObj(raw);
    if (!j) continue;
    let body = stripHtml(jsonStr(j, 'descriptionPlain') || jsonStr(j, 'description'));
    const lists = Array.isArray(j.lists) ? j.lists : [];
    for (const item of lists) {
      const l = asObj(item);
      if (!l) continue;
      body += `\n\n${stripHtml(jsonStr(l, 'text'))}\n${stripHtml(jsonStr(l, 'content'))}`;
    }
    let postedAt: Date | null = null;
    if (typeof j.createdAt === 'number') postedAt = new Date(j.createdAt);
    const cats = asObj(j.categories);
    postings.push({
      source: 'lever',
      company: c.name,
      title: jsonStr(j, 'text'),
      url: jsonStr(j, 'hostedUrl'),
      location: cats ? jsonStr(cats, 'location') : '',
      body: body.trim(),
      postedAt,
      domain: c.domain,
      compRaw: '',
    });
  }
  return { postings, stat: { source: `lever:${c.name}`, ok: true, count: postings.length, cached } };
}

async function rss(c: CompanyEntry): Promise<SourceResult> {
  const url = c.token ?? '';
  const { text, cached, error } = await getText(url, { cacheKey: `rss:${c.name}` });
  if (!text) {
    return { postings: [], stat: { source: `rss:${c.name}`, ok: false, count: 0, cached, error } };
  }
  const items = [...text.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  const postings: Posting[] = items.map((m) => {
    const block = m[1] ?? '';
    const tag = (name: string) => {
      const hit = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i').exec(block);
      return stripHtml(hit?.[1] ?? '');
    };
    return {
      source: 'rss',
      company: tag('author') || c.name,
      title: tag('title'),
      url: tag('link'),
      location: '',
      body: tag('description'),
      postedAt: parseDate(tag('pubDate')),
      domain: c.domain,
      compRaw: '',
    };
  });
  return { postings, stat: { source: `rss:${c.name}`, ok: true, count: postings.length, cached } };
}

async function remotiveQuery(query: string | null, category: string | null): Promise<SourceResult> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (query) params.set('search', query);
  const qs = params.toString();
  const url = `https://remotive.com/api/remote-jobs${qs ? `?${qs}` : ''}`;
  const label = `remotive:${query ?? category ?? 'all'}`;
  const { text, cached, error } = await getText(url, { cacheKey: `remotive:${qs}` });
  if (!text) return { postings: [], stat: { source: label, ok: false, count: 0, cached, error } };
  let jobs: unknown[] = [];
  try {
    const doc = JSON.parse(text) as { jobs?: unknown[] };
    jobs = Array.isArray(doc.jobs) ? doc.jobs : [];
  } catch {
    return { postings: [], stat: { source: label, ok: false, count: 0, cached, error: 'bad json' } };
  }
  const postings: Posting[] = [];
  for (const raw of jobs) {
    const j = asObj(raw);
    if (!j) continue;
    const postedAt = parseDate(jsonStr(j, 'publication_date'));
    if (!withinDays(postedAt, FRESHNESS_MAX_DAYS)) continue;
    postings.push({
      source: 'remotive',
      company: jsonStr(j, 'company_name'),
      title: jsonStr(j, 'title'),
      url: jsonStr(j, 'url'),
      location: jsonStr(j, 'candidate_required_location') || 'Remote',
      body: stripHtml(jsonStr(j, 'description')),
      postedAt,
      domain: 'saas',
      compRaw: jsonStr(j, 'salary'),
    });
  }
  return { postings, stat: { source: label, ok: true, count: postings.length, cached } };
}

async function remoteOk(): Promise<SourceResult> {
  const url = 'https://remoteok.com/api';
  const { text, cached, error } = await getText(url, {
    cacheKey: 'remoteok',
    userAgent: BROWSER_UA,
  });
  if (!text) {
    return { postings: [], stat: { source: 'remoteok', ok: false, count: 0, cached, error } };
  }
  let rows: unknown[] = [];
  try {
    const doc = JSON.parse(text) as unknown;
    rows = Array.isArray(doc) ? doc : [];
  } catch {
    return { postings: [], stat: { source: 'remoteok', ok: false, count: 0, cached, error: 'bad json' } };
  }
  const postings: Posting[] = [];
  for (const raw of rows) {
    const j = asObj(raw);
    if (!j) continue;
    const title = jsonStr(j, 'position');
    if (!title) continue;
    let postedAt: Date | null = parseDate(jsonStr(j, 'date'));
    if (!postedAt && typeof j.epoch === 'number') postedAt = new Date(j.epoch * 1000);
    if (!withinDays(postedAt, FRESHNESS_MAX_DAYS)) continue;
    let sal = '';
    if (typeof j.salary_min === 'number') {
      const hi = typeof j.salary_max === 'number' ? j.salary_max : j.salary_min;
      sal = `$${j.salary_min}-$${hi}`;
    }
    postings.push({
      source: 'remoteok',
      company: jsonStr(j, 'company'),
      title,
      url: jsonStr(j, 'url'),
      location: jsonStr(j, 'location') || 'Remote',
      body: stripHtml(jsonStr(j, 'description')),
      postedAt,
      domain: 'saas',
      compRaw: sal,
    });
  }
  return { postings, stat: { source: 'remoteok', ok: true, count: postings.length, cached } };
}

function adzunaCreds(): { id: string; key: string } | null {
  const id = process.env.ADZUNA_APP_ID?.trim() ?? '';
  const key = process.env.ADZUNA_APP_KEY?.trim() ?? '';
  if (!id || !key) return null;
  return { id, key };
}

async function adzunaQuery(query: string): Promise<SourceResult> {
  const creds = adzunaCreds();
  if (!creds) {
    return {
      postings: [],
      stat: {
        source: `adzuna:${query}`,
        ok: false,
        count: 0,
        cached: false,
        blocked: 'missing ADZUNA_APP_ID or ADZUNA_APP_KEY',
      },
    };
  }
  const params = new URLSearchParams({
    app_id: creds.id,
    app_key: creds.key,
    what: query,
    category: 'it-jobs',
    full_time: '1',
    max_days_old: String(FRESHNESS_MAX_DAYS),
    results_per_page: '50',
    sort_by: 'date',
    'content-type': 'application/json',
  });
  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?${params.toString()}`;
  const { text, cached, error } = await getText(url, { cacheKey: `adzuna:${query}` });
  if (!text) {
    return { postings: [], stat: { source: `adzuna:${query}`, ok: false, count: 0, cached, error } };
  }
  let results: unknown[] = [];
  try {
    const doc = JSON.parse(text) as { results?: unknown[] };
    results = Array.isArray(doc.results) ? doc.results : [];
  } catch {
    return { postings: [], stat: { source: `adzuna:${query}`, ok: false, count: 0, cached, error: 'bad json' } };
  }
  const postings: Posting[] = [];
  for (const raw of results) {
    const j = asObj(raw);
    if (!j) continue;
    const company = asObj(j.company);
    const location = asObj(j.location);
    const postedAt = parseDate(jsonStr(j, 'created'));
    if (!withinDays(postedAt, FRESHNESS_MAX_DAYS)) continue;
    let sal = '';
    if (typeof j.salary_min === 'number' && typeof j.salary_max === 'number') {
      sal = `$${Math.round(j.salary_min)}-$${Math.round(j.salary_max)}`;
    }
    postings.push({
      source: 'adzuna',
      company: company ? jsonStr(company, 'display_name') : '',
      title: jsonStr(j, 'title'),
      url: jsonStr(j, 'redirect_url') || jsonStr(j, 'adref'),
      location: location ? jsonStr(location, 'display_name') : 'US',
      body: stripHtml(jsonStr(j, 'description')),
      postedAt,
      domain: 'saas',
      compRaw: sal,
    });
  }
  return { postings, stat: { source: `adzuna:${query}`, ok: true, count: postings.length, cached } };
}

export async function fetchAllSources(): Promise<{ postings: Posting[]; stats: FetchStat[] }> {
  const tasks: Promise<SourceResult>[] = [];

  for (const c of JAMEY_COMPANIES.filter((x) => x.active && x.token)) {
    if (c.board === 'greenhouse') tasks.push(greenhouse(c));
    else if (c.board === 'lever') tasks.push(lever(c));
  }
  for (const f of JAMEY_FEEDS.filter((x) => x.active && x.token)) {
    tasks.push(rss(f));
  }

  tasks.push(remotiveQuery(null, 'software-dev'));
  for (const q of SEARCH_QUERIES) {
    tasks.push(remotiveQuery(q, 'software-dev'));
  }
  tasks.push(remoteOk());
  for (const q of SEARCH_QUERIES) {
    tasks.push(adzunaQuery(q));
  }

  const settled = await Promise.allSettled(tasks);
  const postings: Posting[] = [];
  const stats: FetchStat[] = [];
  for (const row of settled) {
    if (row.status === 'fulfilled') {
      postings.push(...row.value.postings);
      stats.push(row.value.stat);
    } else {
      stats.push({
        source: 'unknown',
        ok: false,
        count: 0,
        cached: false,
        error: String(row.reason),
      });
    }
  }
  return { postings, stats };
}

export function adzunaConfigured(): boolean {
  return Boolean(process.env.ADZUNA_APP_ID?.trim() && process.env.ADZUNA_APP_KEY?.trim());
}
