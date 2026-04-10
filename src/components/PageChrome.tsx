'use client';

import { usePathname } from 'next/navigation';

/**
 * Full-bleed /ai chat; other routes use centered max-width main.
 */
export function PageChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/ai') {
    return <div className="min-h-dvh">{children}</div>;
  }

  return (
    <main className="min-h-screen pt-12">
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">{children}</div>
    </main>
  );
}
