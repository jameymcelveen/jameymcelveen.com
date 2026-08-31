export const TRACKER_KEY = 'jamey:tracker:v1';

export const TRACKER_STAGES = [
  'favorite',
  'applied',
  'interview',
  'followup',
  'rejected',
  'hired',
] as const;

export type TrackerStage = (typeof TRACKER_STAGES)[number];

export type TrackerEntry = {
  id: string;
  title: string;
  company: string;
  score?: number;
  sourceUrl?: string;
  boardJobId?: string;
  stage: TrackerStage;
  stageChangedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isManual?: boolean;
};

export type TrackerDraft = {
  title: string;
  company: string;
  score?: number;
  sourceUrl?: string;
  boardJobId?: string;
  notes?: string;
  isManual?: boolean;
};

const STAGE_SET = new Set<string>(TRACKER_STAGES);

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function asStage(value: unknown): TrackerStage | null {
  return typeof value === 'string' && STAGE_SET.has(value) ? (value as TrackerStage) : null;
}

export function parseTracker(raw: unknown): TrackerEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: TrackerEntry[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const stage = asStage(r.stage);
    if (!stage) continue;
    if (typeof r.id !== 'string' || typeof r.title !== 'string' || typeof r.company !== 'string') continue;
    if (typeof r.stageChangedAt !== 'string' || typeof r.createdAt !== 'string' || typeof r.updatedAt !== 'string') {
      continue;
    }
    out.push({
      id: r.id,
      title: r.title,
      company: r.company,
      score: typeof r.score === 'number' ? r.score : undefined,
      sourceUrl: typeof r.sourceUrl === 'string' ? r.sourceUrl : undefined,
      boardJobId: typeof r.boardJobId === 'string' ? r.boardJobId : undefined,
      stage,
      stageChangedAt: r.stageChangedAt,
      notes: typeof r.notes === 'string' ? r.notes : undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isManual: r.isManual === true,
    });
  }
  return out;
}

function readRaw(): TrackerEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return parseTracker(JSON.parse(localStorage.getItem(TRACKER_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

function writeRaw(entries: TrackerEntry[]): void {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(entries));
}

export function loadTracker(): TrackerEntry[] {
  return readRaw();
}

export function saveTracker(entries: TrackerEntry[]): void {
  writeRaw(entries);
}

export function upsertFavorite(draft: TrackerDraft): TrackerEntry {
  const entries = readRaw();
  if (draft.boardJobId) {
    const existing = entries.find((e) => e.boardJobId === draft.boardJobId);
    if (existing) return existing;
  }
  const stamp = nowIso();
  const entry: TrackerEntry = {
    id: newId(),
    title: draft.title.trim(),
    company: draft.company.trim(),
    score: draft.score,
    sourceUrl: draft.sourceUrl?.trim() || undefined,
    boardJobId: draft.boardJobId,
    stage: 'favorite',
    stageChangedAt: stamp,
    notes: draft.notes?.trim() || undefined,
    createdAt: stamp,
    updatedAt: stamp,
    isManual: draft.isManual === true,
  };
  writeRaw([entry, ...entries]);
  return entry;
}

export function moveTrackerEntry(id: string, stage: TrackerStage): TrackerEntry | null {
  const entries = readRaw();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  const prev = Date.parse(entries[idx].stageChangedAt);
  const stamp = new Date(Math.max(Date.now(), (Number.isNaN(prev) ? 0 : prev) + 1)).toISOString();
  const next = { ...entries[idx], stage, stageChangedAt: stamp, updatedAt: stamp };
  entries[idx] = next;
  writeRaw(entries);
  return next;
}

export function updateTrackerNotes(id: string, notes: string): TrackerEntry | null {
  const entries = readRaw();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  const next = { ...entries[idx], notes: notes.trim() || undefined, updatedAt: nowIso() };
  entries[idx] = next;
  writeRaw(entries);
  return next;
}

export function removeTrackerEntry(id: string): boolean {
  const entries = readRaw();
  const next = entries.filter((e) => e.id !== id);
  if (next.length === entries.length) return false;
  writeRaw(next);
  return true;
}

export function trackerHasBoardJob(boardJobId: string): boolean {
  return readRaw().some((e) => e.boardJobId === boardJobId);
}

export const STAGE_LABEL: Record<TrackerStage, string> = {
  favorite: 'Favorite',
  applied: 'Applied',
  interview: 'Interview',
  followup: 'Follow-up',
  rejected: 'Rejected',
  hired: 'Hired',
};

export function daysInStage(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'Moved recently';
  const days = Math.max(0, Math.floor((now - then) / 86_400_000));
  if (days === 0) return 'Moved today';
  if (days === 1) return 'Moved 1d ago';
  return `Moved ${days}d ago`;
}
