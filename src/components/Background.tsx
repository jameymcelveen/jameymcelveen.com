'use client';

import { usePathname } from 'next/navigation';
import { isObscuredLabPath } from '@/lib/fit-filter/path';
import { isResumePrintPath } from '@/lib/is-resume-print';

/**
 * Fixed full-viewport backdrop: tiled sand texture (source: assets/sand.jpg) + 135deg gradient.
 * Content scrolls above so frosted glass reveals the static tile pattern behind it.
 */
export function Background() {
  const pathname = usePathname();
  if (isObscuredLabPath(pathname) || isResumePrintPath(pathname)) return null;

  return (
    <div className="site-bg" aria-hidden>
      <div className="site-bg__sand" />
      <div className="site-bg__gradient" />
    </div>
  );
}
