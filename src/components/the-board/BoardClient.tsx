'use client';

import { useEffect, useState } from 'react';
import { AddToTrackerButton } from '@/components/lab/AddToTrackerButton';
import { LabFooter, LabPageHeader } from '@/components/lab/LabPageHeader';
import { ManualJobForm } from '@/components/lab/ManualJobForm';
import { FIT_FILTER_PATH, THE_BOARD_SOURCES_PATH, boardJobPath } from '@/lib/fit-filter/path';
import { stashFitFilterDraft } from '@/lib/fit-filter/draft';
import {
  addManualBoardJob,
  loadManualBoard,
  manualJobToMarkdown,
  type ManualBoardJob,
} from '@/lib/the-board/manual';
import { hitToMarkdown } from '@/lib/the-board/markdown';
import type { BoardHit, BoardViewModel } from '@/lib/the-board/types';

type RefreshBody = {
  board?: BoardViewModel;
  error?: string;
};

export function BoardClient({ initial }: { initial: BoardViewModel }) {
  const [board, setBoard] = useState(initial);
  const [pinned, setPinned] = useState<ManualBoardJob[]>([]);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState(
    initial.scannerUnreachable ? 'scanner unreachable, showing last good scan' : ''
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPinned(loadManualBoard());
  }, []);

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

  const ranked = board.hits.filter((hit) => !hit.nearMiss);
  const near = board.hits.filter((hit) => hit.nearMiss);

  return (
    <div className="lab-page lab-page--wide">
      <div className="lab-page__inner">
        <LabPageHeader
          eyebrow="FIELD TELEMETRY"
          title="The Board"
          lede="The scanner runs the wild boards so I do not have to. Ranked by my own rubric: stack depth, domain, level, comp, freshness. Verdicts are mine."
        />

        <div className="board-toolbar">
          <p className="board-toolbar__scan">
            <time dateTime={board.fetchedAt ?? undefined}>{board.lastScanLabel}</time>
          </p>
          <div className="board-toolbar__actions">
            <a href={THE_BOARD_SOURCES_PATH} className="board-details__link">
              Sources
            </a>
            <button type="button" className="board-refresh" onClick={() => setAdding((v) => !v)}>
              {adding ? 'Cancel' : 'Add job'}
            </button>
            <button type="button" className="board-refresh" onClick={() => void onRefresh()} disabled={busy}>
              {busy ? 'Refreshing' : 'Refresh'}
            </button>
          </div>
        </div>
        {notice ? <p className="board-notice">{notice}</p> : null}

        {adding ? (
          <ManualJobForm
            submitLabel="Pin to Board"
            showNotes
            onCancel={() => setAdding(false)}
            onSubmit={(fields) => {
              const job = addManualBoardJob(fields);
              setPinned(loadManualBoard());
              setAdding(false);
              setNotice(`Pinned ${job.title}. Only on this browser.`);
            }}
          />
        ) : null}

        {board.error && board.hits.length === 0 ? <p className="lab-empty">{board.error}</p> : null}

        {board.empty && !board.error && pinned.length === 0 ? (
          <p className="lab-empty">No ranked hits today. The scanner ran; the board is clear.</p>
        ) : null}

        {pinned.length > 0 ? (
          <>
            <p className="board-section-label">Pinned</p>
            <ol className="board-list">
              {pinned.map((job) => (
                <PinnedRow key={job.id} job={job} />
              ))}
            </ol>
          </>
        ) : null}

        <ol className="board-list" style={pinned.length ? { marginTop: 16 } : undefined}>
          {ranked.map((hit) => (
            <BoardRow key={hit.id} hit={hit} />
          ))}
        </ol>
        {near.length > 0 ? (
          <>
            <p className="board-near-label">Near misses</p>
            <ol className="board-list">
              {near.map((hit) => (
                <BoardRow key={hit.id} hit={hit} />
              ))}
            </ol>
          </>
        ) : null}

        <LabFooter>
          AI as a power-up, not a cheat code.
          <br />
          JAMEY McELVEEN | Principal Software Architect
        </LabFooter>
      </div>
    </div>
  );
}

function BoardRow({ hit }: { hit: BoardHit }) {
  return (
    <li className={hit.nearMiss ? 'board-row board-row--near' : 'board-row'}>
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
        {hit.nearMiss && hit.deduction ? <div className="board-row__deduction">{hit.deduction}</div> : null}
        <div className="board-row__actions">
          <a href={boardJobPath(hit.id)} className="board-row__gates">
            Details
          </a>
          <a
            href={FIT_FILTER_PATH}
            className="board-row__gates"
            onClick={() => stashFitFilterDraft(hitToMarkdown(hit))}
          >
            Run the gates
          </a>
          <AddToTrackerButton
            draft={{
              title: hit.title,
              company: hit.company,
              score: hit.score,
              sourceUrl: hit.url,
              boardJobId: hit.id,
            }}
          />
        </div>
      </div>
    </li>
  );
}

function PinnedRow({ job }: { job: ManualBoardJob }) {
  return (
    <li className="board-row">
      <div className="board-row__score board-row__score--empty fit-filter-display">Pinned</div>
      <div className="board-row__body">
        {job.url ? (
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="board-row__title">
            {job.title}
          </a>
        ) : (
          <span className="board-row__title">{job.title}</span>
        )}
        <div className="board-row__company">{job.company}</div>
        <div className="board-row__meta">
          <span>manual</span>
        </div>
        <div className="board-row__actions">
          <a href={boardJobPath(job.id)} className="board-row__gates">
            Details
          </a>
          <a
            href={FIT_FILTER_PATH}
            className="board-row__gates"
            onClick={() => stashFitFilterDraft(manualJobToMarkdown(job))}
          >
            Run the gates
          </a>
          <AddToTrackerButton
            draft={{
              title: job.title,
              company: job.company,
              sourceUrl: job.url,
              boardJobId: job.id,
              isManual: true,
            }}
          />
        </div>
      </div>
    </li>
  );
}
