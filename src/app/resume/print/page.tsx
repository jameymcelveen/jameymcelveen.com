import { getResume, resumeHref } from '@/data/resume';
import { ResumePrintButton } from './ResumePrintButton';

export default function ResumePrintPage() {
  const resume = getResume();
  const [given, ...familyParts] = resume.name.split(' ');
  const family = familyParts.join(' ');
  const pub = resume.publications[0];
  const contactBits = [
    resume.contact.location,
    resume.contact.phone,
    resume.contact.email,
    resume.contact.website,
    resume.contact.availability,
  ];

  return (
    <div className="resume-print">
      <ResumePrintButton />

      <header>
        <h1 className="resume-print__lockup">
          <span className="resume-print__given">{given}</span>
          <span className="resume-print__family">{family}</span>
        </h1>
        <p className="resume-print__title">{resume.title}</p>
        <p className="resume-print__contact">{contactBits.join(' | ')}</p>
      </header>

      <section className="resume-print__sec">
        <h2 className="resume-print__sec-title">Executive Summary</h2>
        <p className="resume-print__summary">{resume.summary}</p>
      </section>

      <section className="resume-print__sec">
        <h2 className="resume-print__sec-title">Core Competencies</h2>
        <table className="resume-print__skills">
          <tbody>
            {chunk(resume.competencies, 3).map((row) => (
              <tr key={row.map((c) => c.key).join('-')}>
                {row.map((c) => (
                  <td key={c.key}>
                    <span className="resume-print__skill-label">{c.label}</span>
                    {' - '}
                    {c.items.join(', ')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="resume-print__sec">
        <h2 className="resume-print__sec-title">Professional Experience</h2>
        {resume.experience.map((job) => (
          <article key={`${job.company}-${job.start}`} className="resume-print__job">
            <div className="resume-print__jh">
              <span className="resume-print__jt">{job.title}</span>
              <span className="resume-print__jd">{job.period}</span>
            </div>
            <p className="resume-print__jc">
              {job.company}
              {job.domain ? ` | ${job.domain}` : ''}
              {job.url ? (
                <>
                  {' | '}
                  <a href={resumeHref(job.url)}>{job.url}</a>
                </>
              ) : null}
            </p>
            {job.note ? <p className="resume-print__note">{job.note}</p> : null}
            <ul>
              {job.highlights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {job.products.map((product) => (
              <div key={product.name}>
                <div className="resume-print__pl">{product.name}</div>
                <ul>
                  {product.highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </section>

      <section className="resume-print__sec">
        <h2 className="resume-print__sec-title">Community</h2>
        {resume.community.map((item) => (
          <div key={item.organization} className="resume-print__community">
            <div className="resume-print__ct">
              {item.organization}
              {item.url ? (
                <>
                  {' '}
                  <a href={resumeHref(item.url)}>{item.url}</a>
                </>
              ) : null}
            </div>
            <div className="resume-print__cs">{item.role}</div>
            <ul>
              {item.highlights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="resume-print__sec">
        <h2 className="resume-print__sec-title">Education & Publications</h2>
        <div className="resume-print__edu">
          <div className="resume-print__edu-cell">
            <div className="resume-print__edu-label">{resume.education.degree}</div>
            <div className="resume-print__edu-sub">{resume.education.institution}</div>
            {resume.education.notes ? (
              <div className="resume-print__edu-notes">{resume.education.notes}</div>
            ) : null}
          </div>
          <div className="resume-print__edu-cell">
            {pub ? (
              <>
                <div className="resume-print__pub-kicker">
                  {pub.publisher} {pub.year}
                  {pub.coauthor ? ` with ${pub.coauthor}` : ''}
                </div>
                <div className="resume-print__edu-label">
                  {pub.url ? <a href={resumeHref(pub.url)}>{pub.title}</a> : pub.title}
                </div>
                {pub.notes ? <div className="resume-print__edu-notes">{pub.notes}</div> : null}
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}
