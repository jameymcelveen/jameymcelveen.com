'use client';

import { useState } from 'react';
import { FIT_FILTER_PATH } from '@/lib/fit-filter/path';
import type { BoardHit, BoardViewModel } from '@/lib/the-board/types';

type RefreshBody = {
  board?: BoardViewModel;
  error?: string;
};

export function BoardClient({ initial }: { initial: BoardViewModel }) {
  const [board, setBoard] = useState(initial);
  const [notice, setNotice] = useState(
    initial.scannerUnreachable ? 'scanner unreachable, showing last good scan' : ''
  );
  const [busy, setBusy] = useState(false);

  const onRefresh = async () => {
    const key = window.prompt('Admin key');
    if (key == null) return;
    if (!key.trim()) {
      setNotice('refresh is owner-only');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/the-board/refresh', {
        method: 'POST',
        headers: { 'x-admin-key': key },
      });
      const data = (await response.json()) as RefreshBody;
      if (response.status === 401) {
        setNotice('refresh is owner-only');
        return;
      }
      if (data.board) setBoard(data.board);
      if (response.status === 429) {
        setNotice(data.error ?? 'refresh is limited to once per 10 minutes');
        return;
      }
      if (data.board?.scannerUnreachable || data.error) {
        setNotice(data.error ?? 'scanner unreachable, showing last good scan');
        return;
      }
      setNotice('');
    } catch {
      setNotice('scanner unreachable, showing last good scan');
    } finally {
      setBusy(false);
    }
  };

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
            The Board
          </h1>
          <p style={{ margin: 0, maxWidth: 560, fontSize: 15, lineHeight: 1.55, color: '#57504A' }}>
            The scanner runs the wild boards so I do not have to. Ranked by my own rubric: stack
            depth, domain, level, comp, freshness. Verdicts are mine.
          </p>
        </header>

        <div className="board-toolbar">
          <p className="board-toolbar__scan">
            <time dateTime={board.fetchedAt ?? undefined}>{board.lastScanLabel}</time>
          </p>
          <button type="button" className="board-refresh" onClick={onRefresh} disabled={busy}>
            {busy ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
        {notice ? <p className="board-notice">{notice}</p> : null}

        {board.error && board.hits.length === 0 ? (
          <p style={{ margin: '24px 0', fontSize: 15, lineHeight: 1.55, color: '#57504A' }}>
            {board.error}
          </p>
        ) : null}

        {board.empty && !board.error ? (
          <p style={{ margin: '24px 0', fontSize: 15, lineHeight: 1.55, color: '#57504A' }}>
            No ranked hits today. The scanner ran; the board is clear.
          </p>
        ) : null}

        <ol className="board-list">
          {board.hits.map((hit) => (
            <BoardRow key={hit.id} hit={hit} />
          ))}
        </ol>

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

function BoardRow({ hit }: { hit: BoardHit }) {
  return (
    <li className="board-row">
      <div className="board-row__score fit-filter-display">{hit.score}</div>
      <div className="board-row__body">
        <a href={hit.url} target="_blank" rel="noopener noreferrer" className="board-row__title">
          {hit.title}
        </a>
        <div className="board-row__company">{hit.company}</div>
        <div className="board-row__meta">
          {hit.comp ? <span>{hit.comp}</span> : null}
          {hit.remote ? <span className="board-badge">Remote</span> : null}
          {hit.freshness ? <span>{hit.freshness}</span> : null}
          <span>{hit.source}</span>
        </div>
        <a href={FIT_FILTER_PATH} className="board-row__gates">
          Run the gates
        </a>
      </div>
    </li>
  );
}
