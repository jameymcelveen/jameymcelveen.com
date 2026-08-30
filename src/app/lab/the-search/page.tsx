import { FIT_FILTER_PATH } from '@/lib/fit-filter/path';

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
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: '#8A8378',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

export default function TheSearchPage() {
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
            FIELD POSTING
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
            The Search
          </h1>
          <p style={{ margin: 0, maxWidth: 560, fontSize: 15, lineHeight: 1.55, color: '#57504A' }}>
            I am a principal-level .NET architect in an active search. This page is the spec: what I
            build, what I am hunting, and how I decide. Recruiters welcome.
          </p>
        </header>

        <section style={{ padding: '28px 0', borderBottom: '1px solid #D9D3CA' }}>
          <SectionLabel>THE CANDIDATE</SectionLabel>
          <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.55 }}>
            30 years enterprise .NET. Multi-tenant SaaS for ~50,000 orgs at ACS Technologies. HIPAA
            modernization at McLeod Health. Public API and payments platform at SecureGive.
          </p>
          <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.55 }}>
            Ships solo today: QikLog (multi-tenant SaaS: .NET, SignalR, OIDC, Stripe) and Christ
            Medical (open-source clinic EMR: ASP.NET Core, Next.js, PostgreSQL), pro bono.
          </p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
            Wiley author ({'"'}iPhone Game Development{'"'}, 2009, with Chris Craft). Clemson BS
            Computer Engineering. FIRST Robotics mentor.
          </p>
        </section>

        <section style={{ padding: '28px 0' }}>
          <SectionLabel>THE HUNT</SectionLabel>
          <dl style={{ margin: 0, borderTop: '1px solid #D9D3CA' }}>
            {HUNT.map((row) => (
              <div
                key={row.term}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '16px 0',
                  borderBottom: '1px solid #D9D3CA',
                  alignItems: 'baseline',
                }}
              >
                <dt
                  className="fit-filter-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '0.08em',
                    color: '#B94700',
                    minWidth: 88,
                    flexShrink: 0,
                  }}
                >
                  {row.term}
                </dt>
                <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#57504A' }}>
                  {row.detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section style={{ padding: '8px 0 28px' }}>
          <SectionLabel>HOW I DECIDE</SectionLabel>
          <p style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.55 }}>
            Three gates. A posting that fails one does not get a kit.
          </p>
          <div style={{ borderTop: '1px solid #D9D3CA' }}>
            {GATES.map((gate) => (
              <div
                key={gate.name}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '16px 0',
                  borderBottom: '1px solid #D9D3CA',
                  alignItems: 'baseline',
                }}
              >
                <div
                  className="fit-filter-display"
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '0.08em',
                    color: '#546223',
                    minWidth: 88,
                    flexShrink: 0,
                  }}
                >
                  GATE
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{gate.name}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: '#57504A' }}>{gate.note}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.55 }}>
            Every posting I touch goes through this filter. So can yours:
          </p>
          <a href={FIT_FILTER_PATH} className="lab-link-card">
            <div
              className="lab-link-card__title fit-filter-display"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#B94700',
                marginBottom: 6,
              }}
            >
              FIELD INSPECTION
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>
              Run your req through the Fit Filter
            </div>
          </a>
        </section>

        <section style={{ padding: '8px 0 28px' }}>
          <SectionLabel>PROOF OF WORK</SectionLabel>
          <div style={{ borderTop: '1px solid #D9D3CA' }}>
            {PROOF.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="lab-link-row"
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span
                  className="lab-link-row__name"
                  style={{ fontWeight: 600, fontSize: 14, minWidth: 0 }}
                >
                  {item.name}
                </span>
                <span style={{ fontSize: 13, color: '#8A8378' }}>{item.descriptor}</span>
              </a>
            ))}
          </div>
        </section>

        <section style={{ padding: '8px 0 28px' }}>
          <SectionLabel>THE ASK</SectionLabel>
          <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.55 }}>
            If you have a req that survives the gates, I answer fast and interview well. If you are
            not sure, send it anyway and tell me what I am missing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a
              href={MAILTO}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                fontSize: 15,
                fontWeight: 600,
                color: '#B94700',
                textDecoration: 'none',
              }}
            >
              jamey@mcelveen.us
            </a>
            <a
              href="https://www.linkedin.com/in/jameymcelveen/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                fontSize: 15,
                fontWeight: 600,
                color: '#B94700',
                textDecoration: 'none',
              }}
            >
              LinkedIn
            </a>
          </div>
        </section>

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
