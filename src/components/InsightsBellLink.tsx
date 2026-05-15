'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

type Props = {
  /** e.g. fixed top-14 right-4 z-50 for /ai */
  className?: string;
};

export function InsightsBellLink({ className = '' }: Props) {
  const pathname = usePathname();
  const active = pathname === '/dashboard';

  return (
    <Link
      href="/dashboard"
      className={`text-foreground-muted hover:text-accent hover:border-accent/40 inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 transition-colors ${active ? 'text-accent border-accent/50' : ''} ${className}`}
      aria-label="Site insights dashboard"
      title="Site insights"
    >
      <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
    </Link>
  );
}
