'use client';

import { useEffect, useState } from 'react';
import { insightsHeaders, readInsightsKey } from '@/lib/insights-key';

let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;

function fetchAvailable(): Promise<boolean> {
  if (cached !== null) return Promise.resolve(cached);
  const key = readInsightsKey();
  // The dashboard is private: only show the link to someone signed in on this tab.
  if (!key) return Promise.resolve(false);
  if (!inflight) {
    inflight = fetch('/api/analytics/summary', { cache: 'no-store', headers: insightsHeaders(key) })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = (await res.json()) as { connected?: boolean };
        return data.connected === true;
      })
      .catch(() => false)
      .then((ok) => {
        cached = ok;
        inflight = null;
        return ok;
      });
  }
  return inflight;
}

/** True only for a signed-in owner with a live database. Defaults false. */
export function useInsightsAvailable(): boolean {
  const [show, setShow] = useState(cached === true);
  useEffect(() => {
    let cancelled = false;
    void fetchAvailable().then((ok) => {
      if (!cancelled) setShow(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return show;
}
