'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function useStaticSteelBackground(): boolean {
  const [staticBg, setStaticBg] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setStaticBg(true);
      return;
    }

    const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 8;
    const mem = typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number'
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory!
      : 8;

    /* Drifting blobs repaint a large layer — only on strong machines */
    const lowTier = cores < 8 || mem < 8;
    setStaticBg(lowTier);
  }, []);

  return staticBg;
}

/**
 * Gunmetal steel field + slow drifting mesh (transform-only animation).
 * Static when prefers-reduced-motion or low-tier hardware — no JS animation loops.
 */
export function Background() {
  const pathname = usePathname();
  const staticBg = useStaticSteelBackground();

  if (pathname === '/ai') {
    return null;
  }

  return (
    <div
      className="steel-bg"
      data-static={staticBg ? 'true' : 'false'}
      aria-hidden
    >
      <div className="steel-bg__base" />
      <div className="steel-bg__blob steel-bg__blob--1" />
      <div className="steel-bg__blob steel-bg__blob--2" />
      <div className="steel-bg__blob steel-bg__blob--3" />
    </div>
  );
}
