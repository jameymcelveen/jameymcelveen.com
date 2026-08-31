import { LabFooter, LabPageHeader } from '@/components/lab/LabPageHeader';
import { FIT_FILTER_PATH, THE_BOARD_PATH } from '@/lib/fit-filter/path';
import { FRESHNESS_MAX_DAYS, JAMEY_PROFILE, SEARCH_QUERIES } from '@/lib/scanner/profile';
import { loadBoard } from '@/lib/the-board/load';
import type { BoardViewModel } from '@/lib/the-board/types';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'The Search',
  description: 'Field posting. What I build, what I am hunting, and how I decide.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  keywords: [],
  openGraph: {
    title: 'The Search',
    description: 'Field posting. What I build, what I am hunting, and how I decide.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Search',
    description: 'Field posting. What I build, what I am hunting, and how I decide.',
  },
};

const MAILTO = 'mailto:jamey@mcelveen.us?subject=' + encodeURIComponent('Found you via The Search');

const HUNT: { term: string; detail: string }[] = [
  {
    term: 'Role',
    detail:
      'Senior / Staff / Lead / Principal, individual contributor by choice. I have run teams of 20+; the seat I want is the one where I ship. You get architecture-level judgment in your code reviews.',
  },
  {
    term: 'Location',
    detail: '100% remote (US, Eastern Time), or within driving range of Florence, SC.',
  },
  {
    term: 'Stack',
    detail: '.NET/C#, TypeScript/React/Angular, PostgreSQL/SQL, AWS/Azure.',
  },
  {
    term: 'Domains',
    detail: 'In order of pull: healthcare, faith-based and mission work, fintech, B2B SaaS.',
  },
  {
    term: 'Comp',
    detail: 'Discussed like adults, early, so nobody wastes a loop.',
  },
];

const GATES: { name: string; note: string }[] = [
  { name: 'Comp', note: 'Inside the band or we stop there.' },
  {
    name: 'Load-bearing quals',
    note: 'The requirements block, not the title. Titles lie.',
  },
  { name: 'Day shape', note: 'Building systems, not running them.' },
];

const PROOF: { href: string; name: string; descriptor: string; external?: boolean }[] = [
  {
    href: 'https://jameymcelveen.com',
    name: 'jameymcelveen.com',
    descriptor: 'Next.js + Anthropic SDK',
  },
  {
    href: 'https://github.com/jameymcelveen',
    name: 'github.com/jameymcelveen',
    descriptor: 'Source and shipped work',
    external: true,
  },
  {
    href: 'https://qiklog.up.railway.app/tail/demo',
    name: 'QikLog',
    descriptor: 'Live multi-tenant SaaS',
    external: true,
  },
  {
    href: 'https://github.com/christmedical',
    name: 'Christ Medical',
    descriptor: 'Open-source clinic EMR',
    external: true,
  },
  {
    href: FIT_FILTER_PATH,
    name: 'The Fit Filter',
    descriptor: 'Run a posting through',
  },
  {
    href: '/book',
    name: 'The book',
    descriptor: 'Wiley iPhone Game Development',
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="board-section-label" style={{ marginTop: 0 }}>{children}</div>;
}

function CriteriaRow({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="search-dl__row">
      <dt className="search-dl__term fit-filter-display">{term}</dt>
      <dd className="search-dl__detail">{detail}</dd>
    </div>
  );
}

function ScanResults({ board }: { board: BoardViewModel }) {
  const stats = board.stats;
  if (!stats) {
    return <p className="lab-lede">No scan on file yet. Counts land here after the scanner runs.</p>;
  }
  const rows = [
    { term: 'Fetched', detail: `${stats.fetched} postings pulled from sources` },
    { term: 'On board', detail: `${stats.displayed} ranked hits` },
    { term: 'Near miss', detail: `${stats.nearMisses} just under the cut` },
    { term: 'Rejected', detail: `${stats.rejected} failed a gate or the score floor` },
  ];
  return (
    <>
      <dl className="search-dl">
        {rows.map((row) => (
          <CriteriaRow key={row.term} term={row.term} detail={row.detail} />
        ))}
      </dl>
      {board.rejectedByReason.length ? (
        <div style={{ marginTop: 18 }}>
          <SectionLabel>REJECTED BY</SectionLabel>
          <ul className="board-stat-list">
            {board.rejectedByReason.map((row) => (
              <li key={row.reason} className="board-stat-row">
                <div className="board-stat-row__count fit-filter-display">{row.count}</div>
                <div className="board-stat-row__body">
                  <div className="board-stat-row__detail">{row.reason}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export default async function TheSearchPage() {
  const board = await loadBoard();
  const salaryK = Math.round(JAMEY_PROFILE.comp.salaryFloor / 1000);
  return (
    <div className="lab-page">
      <div className="lab-page__inner">
        <LabPageHeader
          eyebrow="FIELD POSTING"
          title="The Search"
          lede="I am a principal-level .NET architect in an active search. This page is the spec: what I build, what I am hunting, and how I decide. Recruiters welcome."
        />

        <div className="board-toolbar">
          <p className="board-toolbar__scan">
            <time dateTime={board.fetchedAt ?? undefined}>{board.lastScanLabel}</time>
          </p>
          <div className="lab-cta-row">
            <a href={THE_BOARD_PATH} className="search-cta">
              View the Board
            </a>
            <a href={FIT_FILTER_PATH} className="search-cta search-cta--ghost">
              Try the Fit Filter
            </a>
          </div>
        </div>

        <section className="search-section">
          <SectionLabel>THE CANDIDATE</SectionLabel>
          <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.55 }}>
            30 years enterprise .NET. Multi-tenant SaaS for ~50,000 orgs at ACS Technologies. HIPAA
            modernization at McLeod Health. Public API and payments platform at SecureGive.
          </p>
          <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.55 }}>
            Ships solo today: QikLog (multi-tenant SaaS: .NET, SignalR, OIDC, Stripe) and Christ Medical
            (open-source clinic EMR: ASP.NET Core, Next.js, PostgreSQL), pro bono.
          </p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
            Wiley author ({'"'}iPhone Game Development{'"'}, 2009, with Chris Craft). Clemson BS Computer
            Engineering. FIRST Robotics mentor.
          </p>
        </section>

        <section className="search-section">
          <SectionLabel>THE HUNT</SectionLabel>
          <dl className="search-dl">
            {HUNT.map((row) => (
              <CriteriaRow key={row.term} term={row.term} detail={row.detail} />
            ))}
          </dl>
        </section>

        <section className="search-section">
          <SectionLabel>SCANNER CRITERIA</SectionLabel>
          <p className="lab-lede" style={{ marginBottom: 14 }}>
            What the board actually queries and cuts on. Human gates above still win.
          </p>
          <dl className="search-dl">
            <CriteriaRow term="Queries" detail={SEARCH_QUERIES.join(' · ')} />
            <CriteriaRow
              term="Comp floor"
              detail={`$${salaryK}K salary or $${JAMEY_PROFILE.comp.hourlyFloor}/hr. Below that, rejected.`}
            />
            <CriteriaRow
              term="Location"
              detail={`Remote US (Eastern), or onsite near ${JAMEY_PROFILE.location.home}.`}
            />
            <CriteriaRow
              term="Level"
              detail={`${JAMEY_PROFILE.level.accept.join(', ')}. Not ${JAMEY_PROFILE.level.reject.join(', ')}.`}
            />
            <CriteriaRow term="Freshness" detail={`Posted within ${FRESHNESS_MAX_DAYS} days.`} />
            <CriteriaRow
              term="Score cut"
              detail={`On the board at ${JAMEY_PROFILE.thresholds.backlogMinScore}+. Near miss band is 15 points below that.`}
            />
          </dl>
        </section>

        <section className="search-section">
          <SectionLabel>WHAT THIS IS</SectionLabel>
          <p style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.55 }}>
            Three small tools, one loop. THE BOARD scans the wild job market daily and ranks what it
            finds by my own rubric. THE FIT FILTER runs any posting, from the Board or pasted from
            anywhere, through the three gates that decide APPLY or SKIP. THE SEARCH, this page, is my
            own req, built the same way I would build anyone else&apos;s. Click through: start on the
            Board, open a listing, run it through the filter, see the verdict. That is not a metaphor. It
            is what actually happens when I decide where to apply.
          </p>
        </section>

        <section className="search-section">
          <SectionLabel>HOW I DECIDE</SectionLabel>
          <p style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.55 }}>
            Three gates. A posting that fails one does not get a kit.
          </p>
          <div>
            {GATES.map((gate) => (
              <div key={gate.name} className="search-dl__row">
                <div className="search-dl__term fit-filter-display" style={{ color: 'var(--lab-remote)' }}>
                  GATE
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{gate.name}</div>
                  <div className="search-dl__detail">{gate.note}</div>
                </div>
              </div>
            ))}
          </div>
          <a href={FIT_FILTER_PATH} className="lab-link-card">
            <div className="lab-link-card__title lab-eyebrow" style={{ marginBottom: 6 }}>
              FIELD INSPECTION
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>
              Run your req through the Fit Filter
            </div>
          </a>
        </section>

        <section className="search-section">
          <SectionLabel>LAST SCAN</SectionLabel>
          <ScanResults board={board} />
        </section>

        <section className="search-section">
          <SectionLabel>PROOF OF WORK</SectionLabel>
          <div>
            {PROOF.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="lab-link-row"
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="lab-link-row__name" style={{ fontWeight: 600, fontSize: 14, minWidth: 0 }}>
                  {item.name}
                </span>
                <span style={{ fontSize: 13, color: 'var(--lab-text-muted)' }}>{item.descriptor}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="search-section">
          <SectionLabel>THE ASK</SectionLabel>
          <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.55 }}>
            If you have a req that survives the gates, I answer fast and interview well. If you are not
            sure, send it anyway and tell me what I am missing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href={MAILTO} className="board-details__link" style={{ fontSize: 15, letterSpacing: 0, textTransform: 'none' }}>
              jamey@mcelveen.us
            </a>
            <a
              href="https://www.linkedin.com/in/jameymcelveen/"
              target="_blank"
              rel="noopener noreferrer"
              className="board-details__link"
              style={{ fontSize: 15, letterSpacing: 0, textTransform: 'none' }}
            >
              LinkedIn
            </a>
          </div>
        </section>

        <LabFooter>
          AI as a power-up, not a cheat code.
          <br />
          JAMEY McELVEEN | Principal Software Architect
        </LabFooter>
      </div>
    </div>
  );
}
