'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/resume', label: 'Resume' },
  { href: '/cover-letters', label: 'Cover Letters' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card fixed top-6 left-1/2 z-50 -translate-x-1/2 px-2 py-2"
    >
      <ul className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative block rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="bg-accent/10 absolute inset-0 rounded-xl"
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
