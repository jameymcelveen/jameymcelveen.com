import { BoardDetailLinks } from '@/components/the-board/BoardDetailLinks';
import { loadBoard } from '@/lib/the-board/load';
import { splitSourceLabel } from '@/lib/the-board/parse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BoardSourcesPage() {
  const board = await loadBoard();
  const total = board.sources.reduce((sum, row) => sum + row.fetched, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FCFAF5',
        color: '#2E2A26',
        padding: '0 16px 64px',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ padding: '40px 0 24px', borderBottom: '1px solid #D9D3CA' }}>
          <div
            className="fit-filter-display"
            style={{
              fontSize: 13,
              letterSpacing: '0.14em',
              color: '#B94700',
              fontWeight: 600,
            }}
          >
            FIELD TELEMETRY
          </div>
          <h1
            className="fit-filter-display"
            style={{
              fontWeight: 800,
              fontSize: 'clamp(30px, 6vw, 44px)',
              margin: '6px 0 10px',
              lineHeight: 1.05,
            }}
          >
            Sources
          </h1>
          <p style={{ margin: 0, maxWidth: 560, fontSize: 15, lineHeight: 1.55, color: '#57504A' }}>
            Each board the scanner hits, and how many postings came back on the last run.
          </p>
        </header>

        <div className="board-toolbar">
          <p className="board-toolbar__scan">
            <time dateTime={board.fetchedAt ?? undefined}>{board.lastScanLabel}</time>
          </p>
          <BoardDetailLinks current="sources" />
        </div>

        {board.sourceCountsFromHits && board.sources.length > 0 ? (
          <p className="board-notice">
            This scan did not store fetch counts. Numbers below are ranked hits already on the
            board, not raw discoveries.
          </p>
        ) : null}

        {board.sources.length === 0 ? (
          <p style={{ margin: '24px 0', fontSize: 15, lineHeight: 1.55, color: '#57504A' }}>
            No sources on file yet. Run a scan and they will land here.
          </p>
        ) : (
          <>
            <p style={{ margin: '20px 0 0', fontSize: 13, color: '#8A8378' }}>
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
                      {label.detail ? (
                        <div className="board-stat-row__detail">{label.detail}</div>
                      ) : null}
                      {note ? <div className="board-stat-row__note">{note}</div> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <footer
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #D9D3CA',
            fontSize: 12,
            color: '#8A8378',
            lineHeight: 1.6,
          }}
        >
          AI as a power-up, not a cheat code.
          <br />
          JAMEY McELVEEN | Principal Software Architect
        </footer>
      </div>
    </div>
  );
}
