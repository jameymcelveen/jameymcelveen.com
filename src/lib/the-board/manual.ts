import { MANUAL_JOB_ID } from '../fit-filter/path.ts';

export const MANUAL_BOARD_KEY = 'jamey:board-manual:v1';

export type ManualBoardJob = {
  id: string;
  title: string;
  company: string;
  url: string;
  notes?: string;
  body?: string;
  createdAt: string;
};

export function isManualJobId(id: string): boolean {
  return MANUAL_JOB_ID.test(id);
}

export function newManualJobId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `m${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export function parseManualBoard(raw: unknown): ManualBoardJob[] {
  if (!Array.isArray(raw)) return [];
  const out: ManualBoardJob[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== 'string' || !isManualJobId(r.id)) continue;
    if (typeof r.title !== 'string' || typeof r.company !== 'string' || typeof r.url !== 'string') continue;
    if (typeof r.createdAt !== 'string') continue;
    out.push({
      id: r.id,
      title: r.title,
      company: r.company,
      url: r.url,
      notes: typeof r.notes === 'string' ? r.notes : undefined,
      body: typeof r.body === 'string' ? r.body : undefined,
      createdAt: r.createdAt,
    });
  }
  return out;
}

export function loadManualBoard(): ManualBoardJob[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return parseManualBoard(JSON.parse(localStorage.getItem(MANUAL_BOARD_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

export function addManualBoardJob(input: {
  title: string;
  company: string;
  url: string;
  notes?: string;
  body?: string;
}): ManualBoardJob {
  const job: ManualBoardJob = {
    id: newManualJobId(),
    title: input.title.trim(),
    company: input.company.trim(),
    url: input.url.trim(),
    notes: input.notes?.trim() || undefined,
    body: input.body?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  const next = [job, ...loadManualBoard().filter((row) => row.id !== job.id)];
  localStorage.setItem(MANUAL_BOARD_KEY, JSON.stringify(next));
  return job;
}

export function getManualBoardJob(id: string): ManualBoardJob | null {
  return loadManualBoard().find((row) => row.id === id) ?? null;
}

export function extractJobUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)\]>'"]+/i);
  if (!match) return null;
  return match[0].replace(/[.,;]+$/, '');
}

export function manualJobToMarkdown(job: ManualBoardJob): string {
  const parts = [`# ${job.title}`, '', `**${job.company}**`];
  if (job.url) parts.push('', `[Original posting](${job.url})`);
  if (job.notes) parts.push('', job.notes);
  if (job.body) parts.push('', '## Posting', '', job.body);
  return `${parts.join('\n')}\n`;
}
