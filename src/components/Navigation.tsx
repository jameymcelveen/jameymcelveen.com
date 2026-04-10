'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getNavigation } from '@/data';

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

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="border-steel bg-background/85 supports-[backdrop-filter]:bg-background/70 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-4xl items-center px-4 sm:px-6" aria-label="Primary">
        <ul className="flex min-h-11 flex-wrap items-center gap-0.5 py-1.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative block rounded-md px-3 py-1.5 text-xs font-medium tracking-tight sm:px-3.5 sm:py-2 sm:text-[13px] ${
                    isActive
                      ? 'text-accent'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="bg-accent/10 absolute inset-0 rounded-md ring-1 ring-accent/25"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                    />
                  )}
                  <span className="relative z-10 font-mono">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.header>
  );
}
