'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAskJameyPanel } from '@/context/AskJameyPanelContext';

export function Navigation() {
  const pathname = usePathname();
  const { openAskJamey } = useAskJameyPanel();

  if (pathname === '/ai') {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 right-0 left-0 z-40"
      style={{ willChange: 'transform' }}
    >
      <nav
        className="text-foreground-muted mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 py-4 text-[15px] sm:px-6"
        aria-label="Primary"
      >
        <Link
          href="/"
          className={`font-medium transition-colors hover:text-[var(--foreground)] ${
            pathname === '/' ? 'text-[var(--foreground)]' : ''
          }`}
        >
          Home
        </Link>
        <span className="text-[var(--text-muted)] select-none" aria-hidden>
          ·
        </span>
        <Link
          href="/resume"
          className={`font-medium transition-colors hover:text-[var(--foreground)] ${
            pathname === '/resume' ? 'text-[var(--foreground)]' : ''
          }`}
        >
          Work
        </Link>
        <span className="text-[var(--text-muted)] select-none" aria-hidden>
          ·
        </span>
        <button type="button" onClick={openAskJamey} className="nav-ask-jamey-pill">
          <span className="mr-1 inline-block opacity-90" aria-hidden>
            ✦
          </span>
          Ask Jamey
        </button>
      </nav>
    </motion.header>
  );
}
