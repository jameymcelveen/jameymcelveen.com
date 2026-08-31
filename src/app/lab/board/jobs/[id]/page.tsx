import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddToTrackerButton } from '@/components/lab/AddToTrackerButton';
import { LabFooter, LabPageHeader } from '@/components/lab/LabPageHeader';
import { ManualJobDetail } from '@/components/lab/ManualJobDetail';
import { CopyMarkdownButton } from '@/components/the-board/CopyMarkdownButton';
import { RunTheGatesLink } from '@/components/the-board/RunTheGatesLink';
import { BOARD_JOB_ID, MANUAL_JOB_ID, THE_BOARD_PATH } from '@/lib/fit-filter/path';
import { loadBoardHit } from '@/lib/the-board/load';
import { hitToMarkdown } from '@/lib/the-board/markdown';
import { markdownToSafeHtml } from '@/lib/the-board/marked-html';
import type { BoardHit } from '@/lib/the-board/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (MANUAL_JOB_ID.test(id)) {
    return { title: 'Pinned job', robots: { index: false, follow: false, nocache: true } };
  }
  if (!BOARD_JOB_ID.test(id)) {
    return { title: 'Job details', robots: { index: false, follow: false } };
  }
  const hit = await loadBoardHit(id);
  return {
    title: hit ? hit.title : 'Job details',
    description: hit ? `${hit.company} · score ${hit.score}` : 'Board posting',
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
  };
}

export default async function BoardJobPage({ params }: PageProps) {
  const { id } = await params;
  if (MANUAL_JOB_ID.test(id)) return <ManualJobDetail id={id} />;
  if (!BOARD_JOB_ID.test(id)) notFound();
  const hit = await loadBoardHit(id);
  if (!hit) notFound();
  return <ScannerJobDetail hit={hit} />;
}

function ScannerJobDetail({ hit }: { hit: BoardHit }) {
  const markdown = hitToMarkdown(hit);
  const tags = [
    hit.comp,
    hit.remote ? 'Remote' : null,
    hit.freshness,
    hit.source,
    hit.location,
  ].filter((v): v is string => Boolean(v));

  return (
    <div className="lab-page">
      <div className="lab-page__inner">
        <LabPageHeader eyebrow="FIELD FILE" title={hit.title} lede={hit.company} />
        <div className="board-toolbar">
          <p className="board-toolbar__scan">
            Score {hit.score}
            {tags.length ? ` · ${tags.join(' · ')}` : ''}
          </p>
          <div className="board-toolbar__actions">
            <nav className="board-details" aria-label="Job actions">
              <a href={THE_BOARD_PATH} className="board-details__link">
                Board
              </a>
              <span className="board-details__dot" aria-hidden="true">
                ·
              </span>
              <a href={hit.url} className="board-details__link" target="_blank" rel="noopener noreferrer">
                Original
              </a>
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
                  title: hit.title,
                  company: hit.company,
                  score: hit.score,
                  sourceUrl: hit.url,
                  boardJobId: hit.id,
                }}
              />
            </nav>
            <CopyMarkdownButton markdown={markdown} />
          </div>
        </div>
        {hit.why.length > 0 ? (
          <ul className="board-stat-list" style={{ marginTop: 8 }}>
            {hit.why.map((line) => (
              <li key={line} className="board-stat-row">
                <div className="board-stat-row__body">
                  <div className="board-stat-row__detail">{line}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <article className="board-md" dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(markdown) }} />
        <LabFooter>
          AI as a power-up, not a cheat code.
          <br />
          JAMEY McELVEEN | Principal Software Architect
        </LabFooter>
      </div>
    </div>
  );
}
