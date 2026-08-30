'use client';

import { FIT_FILTER_PATH } from '@/lib/fit-filter/path';
import { stashFitFilterDraft } from '@/lib/fit-filter/draft';

export function RunTheGatesLink({ markdown }: { markdown: string }) {
  return (
    <a
      href={FIT_FILTER_PATH}
      className="board-details__link"
      onClick={() => stashFitFilterDraft(markdown)}
    >
      Run the gates
    </a>
  );
}
