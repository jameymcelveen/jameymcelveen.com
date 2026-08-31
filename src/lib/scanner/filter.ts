import { parseComp, type CompRange } from './comp.ts';
import { haystack, type Posting } from './posting.ts';
import { JAMEY_PROFILE, type JameyProfile } from './profile.ts';
import { requirementsBlock } from './requirements.ts';

export type Verdict = {
  passed: boolean;
  reason: string;
  hardReject: boolean;
  comp: CompRange;
  stackHits: string[];
  dayShape: string;
};

const REGION_LOCKED = /remote\s*[-(,]?\s*(india|emea|uk|canada|europe|latam|philippines)/i;

function hits(needles: string[], hay: string): string[] {
  return needles.filter((n) => hay.includes(n));
}

function any(needles: string[], hay: string): boolean {
  return needles.some((n) => hay.includes(n));
}

function checkLocation(p: Posting, prof: JameyProfile): string | null {
  const loc = `${p.location} ${p.title}`.toLowerCase();
  const head = (p.body.length > 900 ? p.body.slice(0, 900) : p.body).toLowerCase();

  if (loc.includes('remote') || head.includes('remote') || loc.includes('anywhere')) {
    if (REGION_LOCKED.test(loc)) return 'location: remote but region-locked outside US';
    if (!prof.location.remoteOk && !any(prof.location.onsiteAllow, loc)) {
      return 'location: remote-only posting, profile excludes remote';
    }
    return null;
  }

  if (any(prof.location.onsiteAllow, loc)) return null;
  if (any(prof.location.onsiteDeny, loc)) {
    return `location: onsite in ${p.location}, outside 75mi and not remote`;
  }
  if (!p.location.trim()) return null;
  return `location: onsite in ${p.location}, not remote and not in range`;
}

function checkLevel(p: Posting, prof: JameyProfile): string | null {
  const t = ` ${p.title.toLowerCase()} `;
  if (any(prof.level.reject, t)) return `level: '${p.title}' reads junior`;
  return null;
}

function checkDayShapeTitle(p: Posting, prof: JameyProfile): string | null {
  const matched = hits(prof.dayShape.runSignals, p.title.toLowerCase());
  if (matched.length === 0) return null;
  return `day shape: title is a run-the-system role (${matched.slice(0, 4).join(', ')})`;
}

export function evaluate(p: Posting, prof: JameyProfile = JAMEY_PROFILE): Verdict {
  const hay = haystack(p);
  const req = requirementsBlock(p.body).toLowerCase();
  const compText = `${p.compRaw} ${p.body}`;

  const scam = hits(prof.scamSignals, hay);
  if (scam.length > 0) {
    return reject(`scam signals: ${scam.slice(0, 3).join(', ')}`, true);
  }

  const locFail = checkLocation(p, prof);
  if (locFail) return reject(locFail, true);

  const lvlFail = checkLevel(p, prof);
  if (lvlFail) return reject(lvlFail, true);

  const titleShape = checkDayShapeTitle(p, prof);
  if (titleShape) return reject(titleShape, true);

  const comp = parseComp(compText);
  if (comp.kind === 'salary' && comp.high != null && comp.high < prof.comp.salaryFloor) {
    return reject(
      `comp: tops out at $${comp.high.toLocaleString('en-US')}, floor is $${prof.comp.salaryFloor.toLocaleString('en-US')}`,
      true,
      comp
    );
  }
  if (comp.kind === 'hourly' && comp.high != null && comp.high < prof.comp.hourlyFloor) {
    return reject(
      `comp: tops out at $${comp.high}/hr, floor is $${prof.comp.hourlyFloor}/hr`,
      true,
      comp
    );
  }

  let primary = hits(Object.keys(prof.stack.primary), req);
  const adjacent = hits(Object.keys(prof.stack.adjacent), req);
  if (primary.length === 0) {
    primary = hits(Object.keys(prof.stack.primary), hay);
  }

  if (primary.length === 0 && adjacent.length === 0) {
    return reject('quals: no load-bearing stack overlap in requirements', false, comp);
  }
  if (primary.length === 0 && adjacent.length < 2) {
    return reject(
      `quals: only adjacent overlap (${adjacent.join(', ')}), no primary stack`,
      false,
      comp
    );
  }

  const gated = hits(prof.gapsHard, req);
  if (gated.length > 0) {
    return reject(`gap-gated on required quals: ${gated.join(', ')}`, false, comp, [
      ...primary,
      ...adjacent,
    ]);
  }

  const run = hits(prof.dayShape.runSignals, hay);
  const build = hits(prof.dayShape.buildSignals, hay);
  const shape = build.length > run.length ? 'build' : run.length > 0 ? 'run' : 'unclear';
  if (run.length >= 3 && run.length > build.length) {
    return reject(
      `day shape: run-the-system role (${run.slice(0, 4).join(', ')})`,
      false,
      comp,
      [...primary, ...adjacent]
    );
  }

  return {
    passed: true,
    reason: '',
    hardReject: false,
    comp,
    stackHits: [...primary, ...adjacent],
    dayShape: shape,
  };
}

function reject(
  reason: string,
  hard: boolean,
  comp: CompRange = { low: null, high: null, kind: 'unknown' },
  stackHits: string[] = []
): Verdict {
  return { passed: false, reason, hardReject: hard, comp, stackHits, dayShape: 'unclear' };
}
