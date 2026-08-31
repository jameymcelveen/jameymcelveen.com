'use client';

import { useEffect, useState } from 'react';
import { AddToTrackerButton } from '@/components/lab/AddToTrackerButton';
import { LabFooter, LabPageHeader } from '@/components/lab/LabPageHeader';
import { CopyMarkdownButton } from '@/components/the-board/CopyMarkdownButton';
import { RunTheGatesLink } from '@/components/the-board/RunTheGatesLink';
import { THE_BOARD_PATH } from '@/lib/fit-filter/path';
import { getManualBoardJob, manualJobToMarkdown, type ManualBoardJob } from '@/lib/the-board/manual';

export function ManualJobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<ManualBoardJob | null | undefined>(undefined);

  useEffect(() => {
    setJob(getManualBoardJob(id));
  }, [id]);

  if (job === undefined) {
    return (
      <div className="lab-page">
        <div className="lab-page__inner">
          <p className="lab-empty">Loading pinned job.</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="lab-page">
        <div className="lab-page__inner">
          <LabPageHeader
            eyebrow="FIELD FILE"
            title="Not on this device"
            lede="Pinned jobs live in this browser only. Open the Board here, or paste the posting into Fit Filter."
          />
          <a href={THE_BOARD_PATH} className="board-details__link">
            Board
          </a>
        </div>
      </div>
    );
  }

  const markdown = manualJobToMarkdown(job);

  return (
    <div className="lab-page">
      <div className="lab-page__inner">
        <LabPageHeader eyebrow="FIELD FILE" title={job.title} lede={job.company} />
        <div className="board-toolbar">
          <p className="board-toolbar__scan">Pinned · manual</p>
          <div className="board-toolbar__actions">
            <nav className="board-details" aria-label="Job actions">
              <a href={THE_BOARD_PATH} className="board-details__link">
                Board
              </a>
              {job.url ? (
                <>
                  <span className="board-details__dot" aria-hidden="true">
                    ·
                  </span>
                  <a href={job.url} className="board-details__link" target="_blank" rel="noopener noreferrer">
                    Original
                  </a>
                </>
              ) : null}
              <span className="board-details__dot" aria-hidden="true">
                ·
              </span>
              <RunTheGatesLink markdown={markdown} />
              <span className="board-details__dot" aria-hidden="true">
                ·
              </span>
              <AddToTrackerButton
                className="board-details__link"
                draft={{
                  title: job.title,
                  company: job.company,
                  sourceUrl: job.url,
                  boardJobId: job.id,
                  isManual: true,
                }}
              />
            </nav>
            <CopyMarkdownButton markdown={markdown} />
          </div>
        </div>
        {job.body || job.notes ? (
          <article className="board-md">
            {job.notes ? <p>{job.notes}</p> : null}
            {job.body ? <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{job.body}</pre> : null}
          </article>
        ) : (
          <p className="lab-empty">No posting text stored. Open the original listing if you have a URL.</p>
        )}
        <LabFooter>
          Pinned jobs do not go through the scanner rubric.
          <br />
          JAMEY McELVEEN | Principal Software Architect
        </LabFooter>
      </div>
    </div>
  );
}
