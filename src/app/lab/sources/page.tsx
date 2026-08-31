import { LabFooter, LabPageHeader } from '@/components/lab/LabPageHeader';
import { loadBoard } from '@/lib/the-board/load';
import { splitSourceLabel } from '@/lib/the-board/parse';
import { THE_BOARD_PATH } from '@/lib/fit-filter/path';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Sources',
  description: 'Scanner health. Boards the scanner hits, and how many postings each returned.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  keywords: [],
  openGraph: {
    title: 'Sources',
    description: 'Scanner health. Boards the scanner hits, and how many postings each returned.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sources',
    description: 'Scanner health. Boards the scanner hits, and how many postings each returned.',
  },
};

export default async function BoardSourcesPage() {
  const board = await loadBoard();
  const total = board.sources.reduce((sum, row) => sum + row.fetched, 0);

  return (
    <div className="lab-page lab-page--wide">
      <div className="lab-page__inner">
        <LabPageHeader
          eyebrow="SCANNER HEALTH"
          title="Sources"
          lede="Telemetry, not a scoreboard. Each board the scanner hits, and how many postings came back on the last run."
        />

        <div className="board-toolbar">
          <p className="board-toolbar__scan">
            <time dateTime={board.fetchedAt ?? undefined}>{board.lastScanLabel}</time>
          </p>
          <a href={THE_BOARD_PATH} className="board-details__link">
            Back to Board
          </a>
        </div>

        {board.sourceCountsFromHits && board.sources.length > 0 ? (
          <p className="board-notice">
            This scan did not store fetch counts. Numbers below are ranked hits already on the board, not
            raw discoveries.
          </p>
        ) : null}

        {board.sources.length === 0 ? (
          <p className="lab-empty">No sources on file yet. Run a scan and they will land here.</p>
        ) : (
          <>
            <p className="board-toolbar__scan" style={{ margin: '8px 0 0' }}>
              {total} discovered · {board.sources.length} sources
            </p>
            <ul className="board-stat-list">
              {board.sources.map((row) => {
                const label = splitSourceLabel(row.source);
                const note = !row.ok
                  ? row.blocked || row.error || 'failed'
                  : row.cached
                    ? 'cached today'
                    : null;
                return (
                  <li key={row.source} className="board-stat-row">
                    <div className="board-stat-row__count fit-filter-display">{row.fetched}</div>
                    <div className="board-stat-row__body">
                      <div className="board-stat-row__family">{label.family}</div>
                      {label.detail ? <div className="board-stat-row__detail">{label.detail}</div> : null}
                      {note ? <div className="board-stat-row__note">{note}</div> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <LabFooter>
          AI as a power-up, not a cheat code.
          <br />
          JAMEY McELVEEN | Principal Software Architect
        </LabFooter>
      </div>
    </div>
  );
}
