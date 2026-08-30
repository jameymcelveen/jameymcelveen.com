import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CopyMarkdownButton } from '@/components/the-board/CopyMarkdownButton';
import { RunTheGatesLink } from '@/components/the-board/RunTheGatesLink';
import { BOARD_JOB_ID, THE_BOARD_PATH } from '@/lib/fit-filter/path';
import { loadBoardHit } from '@/lib/the-board/load';
import { hitToMarkdown } from '@/lib/the-board/markdown';
import { markdownToSafeHtml } from '@/lib/the-board/marked-html';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
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
  if (!BOARD_JOB_ID.test(id)) notFound();
  const hit = await loadBoardHit(id);
  if (!hit) notFound();

  const markdown = hitToMarkdown(hit);

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
            FIELD FILE
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
            {hit.title}
          </h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: '#57504A' }}>{hit.company}</p>
        </header>

        <div className="board-toolbar">
          <p className="board-toolbar__scan">Score {hit.score}</p>
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
            </nav>
            <CopyMarkdownButton markdown={markdown} />
          </div>
        </div>

        <article
          className="board-md"
          dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(markdown) }}
        />
      </div>
    </div>
  );
}
