'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FIT_FILTER_PATH, THE_BOARD_PATH } from '@/lib/fit-filter/path';

function linkClass(active: boolean, quiet = false): string {
  const classes = ['lab-nav__link'];
  if (active) classes.push('lab-nav__link--active');
  if (quiet) classes.push('lab-nav__home');
  return classes.join(' ');
}

export function LabNav() {
  const pathname = usePathname();
  const onFilter = pathname === FIT_FILTER_PATH;
  const onBoard = pathname === THE_BOARD_PATH || pathname.startsWith(`${THE_BOARD_PATH}/`);

  return (
    <header className="lab-nav">
      <div className="lab-nav__inner">
        <Link href={THE_BOARD_PATH} className="lab-nav__lockup">
          JAMEY-McELVEEN
        </Link>
        <nav className="lab-nav__links" aria-label="Lab">
          <Link
            href={FIT_FILTER_PATH}
            className={linkClass(onFilter)}
            aria-current={onFilter ? 'page' : undefined}
          >
            Fit Filter
          </Link>
          <Link
            href={THE_BOARD_PATH}
            className={linkClass(onBoard)}
            aria-current={onBoard ? 'page' : undefined}
          >
            The Board
          </Link>
          <Link href="/" className={linkClass(false, true)}>
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
