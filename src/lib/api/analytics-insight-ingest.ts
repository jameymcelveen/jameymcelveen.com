import { existsSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';
import { resolveClientIp } from '@/lib/api/rate-limiter';

const require = createRequire(import.meta.url);

type GeoipLite = typeof import('geoip-lite');

let geoipSingleton: GeoipLite | null = null;

function getGeoip(): GeoipLite {
  if (geoipSingleton) return geoipSingleton;
  const bundled = join(process.cwd(), 'vendor', 'geoip-data');
  if (existsSync(bundled)) {
    process.env.GEODATADIR = bundled;
  }
  geoipSingleton = require('geoip-lite') as GeoipLite;
  return geoipSingleton;
}

const ANALYTICS_EVENT_RL = new Map<string, { count: number; expiresAt: number }>();

function nextHourMs(): number {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 1)).getTime();
}

/** Generous limit — enough for navigation + chat, blocks obvious abuse. */
export function checkAnalyticsEventRateLimit(ip: string): { allowed: boolean } {
  const key = `insight:${ip}`;
  const now = Date.now();
  let e = ANALYTICS_EVENT_RL.get(key);
  if (!e || e.expiresAt <= now) {
    e = { count: 0, expiresAt: nextHourMs() };
    ANALYTICS_EVENT_RL.set(key, e);
  }
  e.count++;
  if (ANALYTICS_EVENT_RL.size > 20_000) {
    for (const [k, v] of ANALYTICS_EVENT_RL) {
      if (v.expiresAt <= now) ANALYTICS_EVENT_RL.delete(k);
    }
  }
  return { allowed: e.count <= 400 };
}

export function geoFromIp(ip: string): { country: string | null; region: string | null } {
  if (!ip || ip === 'unknown') return { country: null, region: null };
  const g = getGeoip().lookup(ip);
  if (!g) return { country: null, region: null };
  const region = g.region ? String(g.region).slice(0, 100) : null;
  return {
    country: g.country ? String(g.country).slice(0, 2).toUpperCase() : null,
    region,
  };
}

export function referrerHostOnly(referrer: string | null | undefined): string | null {
  if (!referrer?.trim()) return null;
  const t = referrer.trim().slice(0, 2048);
  try {
    const u = new URL(t);
    return (u.hostname || '').slice(0, 500) || null;
  } catch {
    return t.slice(0, 500);
  }
}

export function trunc(s: string | null | undefined, max: number): string | null {
  if (s == null) return null;
  const t = String(s);
  return t.length <= max ? t : t.slice(0, max);
}

export const INSIGHT_EVENT_TYPES = [
  'page_view',
  'ask_jamey_question',
  'chip_click',
  'resume_view',
  'resume_download',
  'resume_print',
] as const;

export type InsightEventTypeName = (typeof INSIGHT_EVENT_TYPES)[number];

export function isInsightEventType(s: unknown): s is InsightEventTypeName {
  return typeof s === 'string' && (INSIGHT_EVENT_TYPES as readonly string[]).includes(s);
}

export function resolveGeoForRequest(request: Request): { country: string | null; region: string | null } {
  return geoFromIp(resolveClientIp(request));
}
