'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FIT_FILTER_PATH,
  THE_BOARD_PATH,
  THE_BOARD_SOURCES_PATH,
  THE_SEARCH_PATH,
  THE_TRACKER_PATH,
} from '@/lib/fit-filter/path';

function linkClass(active: boolean, quiet = false): string {
  const classes = ['lab-nav__link'];
  if (active) classes.push('lab-nav__link--active');
  if (quiet) classes.push('lab-nav__link--quiet');
  return classes.join(' ');
}

export function LabNav() {
  const pathname = usePathname() ?? '';
  const onBoard = pathname === THE_BOARD_PATH || pathname.startsWith(`${THE_BOARD_PATH}/`);
  const onFilter = pathname === FIT_FILTER_PATH;
  const onTracker = pathname === THE_TRACKER_PATH;
  const onSearch = pathname === THE_SEARCH_PATH;
  const onSources = pathname === THE_BOARD_SOURCES_PATH;

  return (
    <header className="lab-nav">
      <div className="lab-nav__inner">
        <Link href={THE_BOARD_PATH} className="lab-nav__lockup">
          JAMEY-MCELVEEN
        </Link>
        <nav className="lab-nav__links" aria-label="Lab">
          <Link href={THE_BOARD_PATH} className={linkClass(onBoard)} aria-current={onBoard ? 'page' : undefined}>
            Board
          </Link>
          <Link href={FIT_FILTER_PATH} className={linkClass(onFilter)} aria-current={onFilter ? 'page' : undefined}>
            Fit Filter
          </Link>
          <Link href={THE_TRACKER_PATH} className={linkClass(onTracker)} aria-current={onTracker ? 'page' : undefined}>
            Tracker
          </Link>
          <Link href={THE_SEARCH_PATH} className={linkClass(onSearch)} aria-current={onSearch ? 'page' : undefined}>
            Search
          </Link>
          <Link
            href={THE_BOARD_SOURCES_PATH}
            className={linkClass(onSources, true)}
            aria-current={onSources ? 'page' : undefined}
          >
            Sources
          </Link>
        </nav>
      </div>
    </header>
  );
}
