'use client';

import { useEffect, useState } from 'react';

let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;

function fetchAvailable(): Promise<boolean> {
  if (cached !== null) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/analytics/summary', { cache: 'no-store' })
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

/** True only after the summary API reports a live database. Defaults false. */
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
