export type CompKind = 'unknown' | 'salary' | 'hourly';

export type CompRange = {
  low: number | null;
  high: number | null;
  kind: CompKind;
};

export const COMP_NONE: CompRange = { low: null, high: null, kind: 'unknown' };

const SALARY =
  /\$\s?(\d{2,3})(?:,(\d{3}))?\s?(k\b)?(?:\s?(?:-|[\u2013\u2014]|to)\s?\$?\s?(\d{2,3})(?:,(\d{3}))?\s?(k\b)?)?/gi;

const HOURLY = /\$\s?(\d{2,3})(?:\.\d+)?\s?(?:\/|\s?per\s?)\s?(?:hr|hour)/gi;

function normalize(a: string, b: string, k: string): number | null {
  if (b) return Number.parseInt(a + b, 10);
  const n = Number.parseInt(a, 10);
  if (k) return n * 1000;
  if (n < 500) return n * 1000;
  return n;
}

export function parseComp(text: string | null | undefined): CompRange {
  if (!text) return COMP_NONE;

  const hourly: number[] = [];
  for (const m of text.matchAll(HOURLY)) {
    const v = Number.parseInt(m[1] ?? '', 10);
    if (v >= 10 && v <= 400) hourly.push(v);
  }
  if (hourly.length > 0) {
    return { low: Math.min(...hourly), high: Math.max(...hourly), kind: 'hourly' };
  }

  let best: { low: number; high: number } | null = null;
  for (const m of text.matchAll(SALARY)) {
    const lo = normalize(m[1] ?? '', m[2] ?? '', m[3] ?? '');
    if (lo === null || lo < 30_000 || lo > 900_000) continue;
    const hi = m[4] ? (normalize(m[4], m[5] ?? '', m[6] ?? '') ?? lo) : lo;
    if (!best || hi > best.high) best = { low: lo, high: hi };
  }

  return best ? { low: best.low, high: best.high, kind: 'salary' } : COMP_NONE;
}

export function formatComp(comp: CompRange): string | null {
  if (comp.kind === 'salary' && comp.high != null) {
    const lo = comp.low != null ? `$${Math.round(comp.low / 1000)}K` : '';
    const hi = `$${Math.round(comp.high / 1000)}K`;
    return lo && comp.low !== comp.high ? `${lo}-${hi}` : hi;
  }
  if (comp.kind === 'hourly' && comp.high != null) {
    return `$${comp.low ?? comp.high}-$${comp.high}/hr`;
  }
  return null;
}
