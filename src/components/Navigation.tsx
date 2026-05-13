'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getNavigation } from '@/data';
import { InsightsBellLink } from '@/components/InsightsBellLink';

export function Navigation() {
  const pathname = usePathname();
  const [showCoverLetters, setShowCoverLetters] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('cover-letters-auth');
    setShowCoverLetters(stored === 'true');

    const handleStorage = () => {
      const s = sessionStorage.getItem('cover-letters-auth');
      setShowCoverLetters(s === 'true');
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('cover-letters-auth');
    setShowCoverLetters(stored === 'true');
  }, [pathname]);

  const allNavItems = getNavigation();
  const navItems = allNavItems.filter(
    (item) => !item.protected || (item.protected && showCoverLetters)
  );

  if (pathname === '/ai') {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="nav-glass fixed top-0 right-0 left-0 z-40 border-b border-[var(--glass-border)]"
      style={{ willChange: 'transform' }}
    >
      <nav className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 sm:px-6" aria-label="Primary">
        <ul className="flex min-h-12 min-w-0 flex-1 flex-wrap items-center gap-1 py-2 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative block px-3 py-2 text-xs font-medium tracking-tight sm:px-3.5 sm:text-[13px] ${
                    isActive ? 'text-foreground' : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <span className="relative z-10 font-mono">{item.label}</span>
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="bg-[var(--clemson-orange)] absolute right-3 bottom-1 left-3 h-0.5 rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <InsightsBellLink />
      </nav>
    </motion.header>
  );
}
