'use client';

import { useEffect, useMemo, useState } from 'react';
import { LabFooter, LabPageHeader } from '@/components/lab/LabPageHeader';
import { ManualJobForm } from '@/components/lab/ManualJobForm';
import { boardJobPath } from '@/lib/fit-filter/path';
import {
  STAGE_LABEL,
  TRACKER_STAGES,
  daysInStage,
  loadTracker,
  moveTrackerEntry,
  removeTrackerEntry,
  updateTrackerNotes,
  upsertFavorite,
  type TrackerEntry,
  type TrackerStage,
} from '@/lib/tracker/store';

export function TrackerClient() {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setEntries(loadTracker());
  }, []);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(TRACKER_STAGES.map((stage) => [stage, [] as TrackerEntry[]])) as Record<
      TrackerStage,
      TrackerEntry[]
    >;
    for (const entry of entries) map[entry.stage].push(entry);
    return map;
  }, [entries]);

  const refresh = () => setEntries(loadTracker());

  return (
    <div className="lab-page lab-page--wide">
      <div className="lab-page__inner">
        <LabPageHeader
          eyebrow="FIELD PIPELINE"
          title="Tracker"
          lede="Favorite, apply, interview, follow up. No gamification. Just where each req stands."
        />

        <div className="board-toolbar">
          <p className="board-toolbar__scan">
            {entries.length === 0 ? 'Empty' : `${entries.length} in play`}
          </p>
          <button type="button" className="board-refresh" onClick={() => setAdding((v) => !v)}>
            {adding ? 'Cancel' : 'Add job'}
          </button>
        </div>

        {adding ? (
          <ManualJobForm
            submitLabel="Add to Favorite"
            showNotes
            onCancel={() => setAdding(false)}
            onSubmit={(fields) => {
              upsertFavorite({
                title: fields.title,
                company: fields.company,
                sourceUrl: fields.url || undefined,
                notes: fields.notes,
                isManual: true,
              });
              setAdding(false);
              refresh();
            }}
          />
        ) : null}

        {entries.length === 0 && !adding ? (
          <p className="lab-empty">
            No favorites yet. Star a job on the Board or run something through the Fit Filter.
          </p>
        ) : (
          <div className="tracker-board">
            {TRACKER_STAGES.map((stage) => (
              <section key={stage} className="tracker-col" aria-label={STAGE_LABEL[stage]}>
                <div className="tracker-col__head">
                  <h2 className="tracker-col__name">{STAGE_LABEL[stage]}</h2>
                  <span className="tracker-col__count">{grouped[stage].length}</span>
                </div>
                <div className="tracker-col__list">
                  {grouped[stage].map((entry) => (
                    <TrackerCard key={entry.id} entry={entry} onChange={refresh} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <LabFooter>
          Rejected and Hired can still be moved back. Archive is remove.
          <br />
          JAMEY McELVEEN | Principal Software Architect
        </LabFooter>
      </div>
    </div>
  );
}

function TrackerCard({ entry, onChange }: { entry: TrackerEntry; onChange: () => void }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(entry.notes ?? '');

  return (
    <article className="tracker-card">
      <p className="tracker-card__title">{entry.title}</p>
      <p className="tracker-card__company">{entry.company}</p>
      <p className="tracker-card__meta">
        {entry.score != null ? `Score ${entry.score} · ` : null}
        {daysInStage(entry.stageChangedAt)}
      </p>
      <div className="tracker-card__actions">
        <label className="board-toolbar__scan" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Move
          <select
            value={entry.stage}
            onChange={(e) => {
              moveTrackerEntry(entry.id, e.target.value as TrackerStage);
              onChange();
            }}
            aria-label={`Move ${entry.title}`}
          >
            {TRACKER_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABEL[stage]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="board-row__gates" onClick={() => setNotesOpen((v) => !v)}>
          Notes
        </button>
        {entry.boardJobId ? (
          <a href={boardJobPath(entry.boardJobId)} className="board-row__gates">
            Details
          </a>
        ) : null}
        {entry.sourceUrl ? (
          <a href={entry.sourceUrl} className="board-row__gates" target="_blank" rel="noopener noreferrer">
            Open
          </a>
        ) : null}
        <button
          type="button"
          className="board-row__gates"
          onClick={() => {
            removeTrackerEntry(entry.id);
            onChange();
          }}
        >
          Remove
        </button>
      </div>
      {notesOpen ? (
        <textarea
          value={notes}
          rows={3}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            updateTrackerNotes(entry.id, notes);
            onChange();
          }}
        />
      ) : null}
    </article>
  );
}
