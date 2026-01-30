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
    // Check authentication status
    const stored = sessionStorage.getItem('cover-letters-auth');
    setShowCoverLetters(stored === 'true');

    // Listen for storage changes (in case user unlocks in another tab)
    const handleStorage = () => {
      const stored = sessionStorage.getItem('cover-letters-auth');
      setShowCoverLetters(stored === 'true');
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Re-check on pathname change (user might have just unlocked)
  useEffect(() => {
    const stored = sessionStorage.getItem('cover-letters-auth');
    setShowCoverLetters(stored === 'true');
  }, [pathname]);

  const allNavItems = getNavigation();
  const navItems = allNavItems.filter(
    (item) => !item.protected || (item.protected && showCoverLetters)
  );

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card fixed top-4 left-1/2 z-50 -translate-x-1/2 px-1.5 py-1.5 sm:top-6 sm:px-2 sm:py-2"
    >
      <ul className="flex items-center gap-0.5 sm:gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative block rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm ${
                  isActive ? 'text-accent' : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="bg-accent/10 absolute inset-0 rounded-lg sm:rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
