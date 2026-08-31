'use client';

import { useEffect, useState } from 'react';
import { THE_TRACKER_PATH } from '@/lib/fit-filter/path';
import { trackerHasBoardJob, upsertFavorite, type TrackerDraft } from '@/lib/tracker/store';

export function AddToTrackerButton({
  draft,
  className = 'board-row__gates',
}: {
  draft: TrackerDraft;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (draft.boardJobId) setSaved(trackerHasBoardJob(draft.boardJobId));
  }, [draft.boardJobId]);

  if (saved) {
    return (
      <a href={THE_TRACKER_PATH} className={className}>
        On Tracker
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        upsertFavorite(draft);
        setSaved(true);
      }}
    >
      Favorite
    </button>
  );
}
