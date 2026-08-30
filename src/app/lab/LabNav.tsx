'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FIT_FILTER_PATH, THE_SEARCH_PATH } from '@/lib/fit-filter/path';

function linkClass(active: boolean, quiet = false): string {
  const classes = ['lab-nav__link'];
  if (active) classes.push('lab-nav__link--active');
  if (quiet) classes.push('lab-nav__home');
  return classes.join(' ');
}

export function LabNav() {
  const pathname = usePathname();
  const onSearch = pathname === THE_SEARCH_PATH;
  const onFilter = pathname === FIT_FILTER_PATH;

  return (
    <header className="lab-nav">
      <div className="lab-nav__inner">
        <Link href={THE_SEARCH_PATH} className="lab-nav__lockup">
          JAMEY-McELVEEN
        </Link>
        <nav className="lab-nav__links" aria-label="Lab">
          <Link
            href={THE_SEARCH_PATH}
            className={linkClass(onSearch)}
            aria-current={onSearch ? 'page' : undefined}
          >
            The Search
          </Link>
          <Link
            href={FIT_FILTER_PATH}
            className={linkClass(onFilter)}
            aria-current={onFilter ? 'page' : undefined}
          >
            Fit Filter
          </Link>
          <Link href="/" className={linkClass(false, true)}>
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
