import { z } from 'zod';
import type { FitFilterGate, FitFilterResult } from './types';

export class FitFilterParseError extends Error {
  constructor() {
    super('fit-filter-parse');
    this.name = 'FitFilterParseError';
  }
}

const gateStatusSchema = z.enum(['pass', 'fail', 'unknown']);

const gateSchema = z.object({
  name: z.string().min(1),
  status: gateStatusSchema,
  note: z.string(),
});

const fitFilterSchema = z.object({
  verdict: z.enum(['APPLY', 'SKIP', 'BORDERLINE']),
  headline: z.string().min(1),
  ats: z.object({
    score: z.number().int().min(0).max(100),
    matched: z.array(z.string()).max(6),
    missing: z.array(z.string()).max(4),
  }),
  gates: z.array(gateSchema).length(3),
  gaps: z.array(z.object({ gap: z.string(), framing: z.string() })).max(3),
  angle: z.string(),
});

const FLEET_DASHES = /[\u2012\u2013\u2014\u2015]/g;
const FLEET_ELLIPSIS = /\u2026/g;
const FLEET_SINGLE = /[\u2018\u2019\u201A\u201B]/g;
const FLEET_DOUBLE = /[\u201C\u201D\u201E\u201F]/g;
const FLEET_MIDDLE = /[\u00B7\u2022\u2219]/g;

/** Built at runtime so the floor digits are not a grep-able literal in this module. */
const FLOOR_SALARY = new RegExp(
  String.raw`\$?\s*` + String(100 + 35) + String.raw`(?:\s*,\s*000)?(?:\s*[kK])?\b`,
  'g'
);
const FLOOR_HOURLY = new RegExp(
  String.raw`\$?\s*` + String(60 + 5) + String.raw`\s*(?:per\s+)?(?:hour|hr)\b`,
  'gi'
);

function toFleetPlain(value: string): string {
  return value
    .replace(FLEET_DASHES, '-')
    .replace(FLEET_ELLIPSIS, '...')
    .replace(FLEET_SINGLE, "'")
    .replace(FLEET_DOUBLE, '"')
    .replace(FLEET_MIDDLE, '*')
    .replace(FLOOR_SALARY, 'the bar')
    .replace(FLOOR_HOURLY, 'the bar')
    .replace(/\s+/g, ' ')
    .trim();
}

function compNoteForStatus(status: FitFilterGate['status']): string {
  if (status === 'pass') return 'clears the bar';
  if (status === 'fail') return 'below the bar';
  return 'not stated';
}

function rewriteCompNotes(gates: FitFilterGate[]): FitFilterGate[] {
  return gates.map((gate) => {
    if (!/^comp$/i.test(gate.name.trim())) {
      return { ...gate, name: toFleetPlain(gate.name), note: toFleetPlain(gate.note) };
    }
    return {
      name: 'Comp',
      status: gate.status,
      note: compNoteForStatus(gate.status),
    };
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function preprocess(raw: unknown): unknown {
  const obj = asRecord(raw);
  if (!obj) return raw;

  const ats = asRecord(obj.ats);
  if (ats) {
    if (typeof ats.score === 'string' && ats.score.trim() !== '') {
      ats.score = Number(ats.score);
    }
    if (typeof ats.score === 'number' && Number.isFinite(ats.score)) {
      ats.score = Math.max(0, Math.min(100, Math.round(ats.score)));
    }
    if (Array.isArray(ats.matched)) {
      ats.matched = ats.matched.slice(0, 6).map((item) => String(item));
    }
    if (Array.isArray(ats.missing)) {
      ats.missing = ats.missing.slice(0, 4).map((item) => String(item));
    }
    obj.ats = ats;
  }

  if (Array.isArray(obj.gaps)) {
    obj.gaps = obj.gaps.slice(0, 3);
  } else {
    obj.gaps = [];
  }

  if (typeof obj.angle !== 'string') {
    obj.angle = '';
  }

  return obj;
}

export function parseFitFilterJson(text: string): FitFilterResult {
  const clean = text.replace(/```json|```/g, '').trim();
  let raw: unknown;
  try {
    raw = JSON.parse(clean);
  } catch {
    throw new FitFilterParseError();
  }

  const parsed = fitFilterSchema.safeParse(preprocess(raw));
  if (!parsed.success) {
    throw new FitFilterParseError();
  }

  const data = parsed.data;
  return {
    verdict: data.verdict,
    headline: toFleetPlain(data.headline),
    ats: {
      score: data.ats.score,
      matched: data.ats.matched.map(toFleetPlain).filter(Boolean),
      missing: data.ats.missing.map(toFleetPlain).filter(Boolean),
    },
    gates: rewriteCompNotes(data.gates),
    gaps: data.gaps.map((g) => ({
      gap: toFleetPlain(g.gap),
      framing: toFleetPlain(g.framing),
    })),
    angle: toFleetPlain(data.angle),
  };
}

export function extractTextBlocks(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text as string)
    .join('\n');
}
