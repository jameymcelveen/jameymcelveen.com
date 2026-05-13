'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from '@/components/SiteFooter';

/**
 * Full-bleed /ai chat; other routes use centered max-width main.
 */
export function PageChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/ai') {
    return (
      <div className="flex min-h-dvh flex-col">
        <div className="min-h-0 flex-1">{children}</div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-12">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
