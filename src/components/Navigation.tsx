'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAskJameyPanel } from '@/context/AskJameyPanelContext';

export function Navigation() {
  const pathname = usePathname();
  const { openAskJamey } = useAskJameyPanel();

  if (pathname === '/ai') {
    return null;
  }

  return (
    <header className="nav-steel-enter fixed top-0 right-0 left-0 z-40">
      <div className="nav-title-bar">
        <nav
          className="text-foreground-muted mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 gap-y-2 px-4 py-3 text-[15px] sm:px-6"
          aria-label="Primary"
        >
          <Link
            href="/"
            className={`btn-glass btn-glass--sm ${pathname === '/' ? 'btn-glass--accent' : ''}`}
          >
            Home
          </Link>
          <Link
            href="/resume"
            className={`btn-glass btn-glass--sm ${pathname === '/resume' ? 'btn-glass--accent' : ''}`}
          >
            Work
          </Link>
          <Link
            href="/dashboard"
            className={`btn-glass btn-glass--sm ${pathname === '/dashboard' ? 'btn-glass--accent' : ''}`}
          >
            Dashboard
          </Link>
          <button type="button" onClick={openAskJamey} className="nav-ask-jamey-pill">
            <span className="mr-1 inline-block opacity-90" aria-hidden>
              ✦
            </span>
            Ask Jamey
          </button>
        </nav>
      </div>
    </header>
  );
}
