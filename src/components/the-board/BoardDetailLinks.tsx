import Link from 'next/link';
import { THE_BOARD_SOURCES_PATH, THE_SEARCH_PATH } from '@/lib/fit-filter/path';

export function BoardDetailLinks({ current }: { current?: 'search' | 'sources' }) {
  return (
    <nav className="board-details" aria-label="Board details">
      <Link
        href={THE_SEARCH_PATH}
        className={current === 'search' ? 'board-details__link is-current' : 'board-details__link'}
        aria-current={current === 'search' ? 'page' : undefined}
      >
        Search details
      </Link>
      <span className="board-details__dot" aria-hidden="true">
        ·
      </span>
      <Link
        href={THE_BOARD_SOURCES_PATH}
        className={current === 'sources' ? 'board-details__link is-current' : 'board-details__link'}
        aria-current={current === 'sources' ? 'page' : undefined}
      >
        Sources
      </Link>
    </nav>
  );
}
