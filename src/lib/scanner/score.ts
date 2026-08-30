import type { Verdict } from './filter';
import { haystack, type Posting } from './posting';
import { JAMEY_PROFILE, type JameyProfile } from './profile';
import { requirementsBlock } from './requirements';

export type ScoreResult = {
  total: number;
  parts: Record<string, number>;
  why: string[];
};

const HEALTHCARE = /\b(ehr|emr|patient|clinical|hipaa|fhir|hl7|provider|payer)\b/;
const MISSION = /\b(ministry|church|nonprofit|mission|faith|donor|giving)\b/;
const REMOTE_FIRST = /\b(fully remote|100% remote|remote-first|distributed team)\b/;
const ONSITEISH = /hybrid|in.office|on.?site/;
const STACK_SATURATION = 40;

export function score(
  p: Posting,
  v: Verdict,
  prof: JameyProfile = JAMEY_PROFILE
): ScoreResult {
  const r = prof.rubric;
  const hay = haystack(p);
  const req = requirementsBlock(p.body).toLowerCase();
  const parts: Record<string, number> = {};
  const why: string[] = [];

  let raw = 0;
  const hitSet = new Set<string>();
  for (const [kw, w] of Object.entries(prof.stack.primary)) {
    if (req.includes(kw)) {
      raw += w * 2;
      hitSet.add(kw);
    } else if (hay.includes(kw)) {
      raw += w;
      hitSet.add(kw);
    }
  }
  for (const [kw, w] of Object.entries(prof.stack.adjacent)) {
    if (req.includes(kw)) {
      raw += w;
      hitSet.add(kw);
    } else if (hay.includes(kw)) {
      raw += w * 0.5;
      hitSet.add(kw);
    }
  }
  let pts = Math.round(r.stackDepth * Math.min(raw / STACK_SATURATION, 1));
  parts.stack = pts;
  why.push(
    `stack ${pts}/${r.stackDepth}: ${hitSet.size > 0 ? [...hitSet].sort().slice(0, 8).join(', ') : 'none'}`
  );

  let d = prof.domainAffinity[p.domain] != null ? p.domain : 'other';
  if (HEALTHCARE.test(hay)) d = 'healthcare';
  else if (MISSION.test(hay) && prof.domainAffinity.mission != null) d = 'mission';
  const aff = prof.domainAffinity[d] ?? 0.2;
  pts = Math.round(r.domain * aff);
  parts.domain = pts;
  why.push(`domain ${pts}/${r.domain}: ${d}`);

  const t = p.title.toLowerCase();
  let lbl: string;
  if (
    t.includes('principal') ||
    t.includes('staff') ||
    t.includes('distinguished') ||
    t.includes('architect')
  ) {
    pts = r.level;
    lbl = 'principal/staff tier';
  } else if (t.includes('lead') || t.includes('senior') || t.includes('sr.')) {
    pts = Math.round(r.level * 0.8);
    lbl = 'senior/lead tier';
  } else {
    pts = Math.round(r.level * 0.4);
    lbl = 'level unclear from title';
  }
  parts.level = pts;
  why.push(`level ${pts}/${r.level}: ${lbl}`);

  const floor = prof.comp.salaryFloor;
  if (v.comp.kind === 'salary' && v.comp.high != null) {
    if (v.comp.high >= floor * 1.25) {
      pts = r.comp;
      lbl = `$${v.comp.low?.toLocaleString('en-US')}-$${v.comp.high.toLocaleString('en-US')}, well over floor`;
    } else if (v.comp.high >= floor) {
      pts = Math.round(r.comp * 0.7);
      lbl = `$${v.comp.low?.toLocaleString('en-US')}-$${v.comp.high.toLocaleString('en-US')}, clears floor`;
    } else {
      pts = 0;
      lbl = 'under floor';
    }
  } else if (v.comp.kind === 'hourly' && v.comp.high != null) {
    pts = v.comp.high >= prof.comp.hourlyFloor * 1.3 ? r.comp : Math.round(r.comp * 0.7);
    lbl = `$${v.comp.low}-$${v.comp.high}/hr`;
  } else {
    pts = Math.round(r.comp * 0.4);
    lbl = 'not stated, ask';
  }
  parts.comp = pts;
  why.push(`comp ${pts}/${r.comp}: ${lbl}`);

  if (p.postedAt) {
    const age = Math.floor((Date.now() - p.postedAt.getTime()) / 86_400_000);
    if (age <= 3) {
      pts = r.freshness;
      lbl = `${age}d old`;
    } else if (age <= 10) {
      pts = Math.round(r.freshness * 0.7);
      lbl = `${age}d old`;
    } else if (age <= 30) {
      pts = Math.round(r.freshness * 0.4);
      lbl = `${age}d old`;
    } else {
      pts = 0;
      lbl = `${age}d old, likely stale`;
    }
  } else {
    pts = Math.round(r.freshness * 0.5);
    lbl = 'no date';
  }
  parts.freshness = pts;
  why.push(`freshness ${pts}/${r.freshness}: ${lbl}`);

  if (REMOTE_FIRST.test(hay)) {
    pts = r.remoteCulture;
    lbl = 'remote-first language';
  } else if (hay.includes('remote') && !ONSITEISH.test(hay)) {
    pts = Math.round(r.remoteCulture * 0.8);
    lbl = 'remote';
  } else if (hay.includes('hybrid')) {
    pts = Math.round(r.remoteCulture * 0.3);
    lbl = 'hybrid';
  } else if (prof.location.onsiteAllow.some((x) => hay.includes(x))) {
    pts = Math.round(r.remoteCulture * 0.5);
    lbl = 'onsite but in range';
  } else {
    pts = Math.round(r.remoteCulture * 0.2);
    lbl = 'unclear';
  }
  parts.remote = pts;
  why.push(`remote ${pts}/${r.remoteCulture}: ${lbl}`);

  if (prof.aiFriendlySignals.negative.some((x) => hay.includes(x))) {
    pts = 0;
    lbl = 'AI use restricted';
  } else if (prof.aiFriendlySignals.positive.some((x) => hay.includes(x))) {
    pts = r.aiFriendly;
    lbl = 'AI-positive language';
  } else {
    pts = Math.round(r.aiFriendly * 0.4);
    lbl = 'neutral';
  }
  parts.ai = pts;
  why.push(`ai ${pts}/${r.aiFriendly}: ${lbl}`);

  return { total: Object.values(parts).reduce((a, b) => a + b, 0), parts, why };
}

export function weakestWhy(why: string[]): string {
  let worst = why[0] ?? 'below cut';
  let worstRatio = 1;
  for (const line of why) {
    const m = /(\d+)\/(\d+)/.exec(line);
    if (!m) continue;
    const ratio = Number(m[1]) / Math.max(Number(m[2]), 1);
    if (ratio < worstRatio) {
      worstRatio = ratio;
      worst = line;
    }
  }
  return worst;
}
