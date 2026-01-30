'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import {
  getPersonalInfo,
  getResumeData,
  getWorkExperience,
  getSkills,
  getEngineering,
  getContactInfo,
} from '@/data';

export default function ResumePrintPage() {
  const personal = getPersonalInfo();
  const resume = getResumeData();
  const jobs = getWorkExperience();
  const skills = getSkills();
  const engineering = getEngineering();
  const contact = getContactInfo();

  return (
    <div className="resume-print">
      <style jsx>{`
        .resume-print {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        .container {
          max-width: 850px;
          margin: 20px auto;
          padding: 30px;
          background: white;
          border: 1px solid #eee;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 30px;
        }
        header {
          grid-column: 1 / -1;
          border-bottom: 3px solid #1a2a6c;
          padding-bottom: 15px;
          margin-bottom: 10px;
        }
        h1 {
          margin: 0;
          color: #1a2a6c;
          font-size: 28pt;
          text-transform: uppercase;
        }
        .subtitle {
          font-size: 14pt;
          color: #0052cc;
          font-weight: bold;
        }
        .sidebar {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 5px;
          font-size: 10pt;
        }
        .sidebar h3 {
          color: #1a2a6c;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          text-transform: uppercase;
          font-size: 11pt;
        }
        .sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
        }
        .sidebar li {
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sidebar svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: #666;
        }
        .main h2 {
          color: #1a2a6c;
          border-bottom: 1px solid #eee;
          text-transform: uppercase;
          font-size: 14pt;
          margin-top: 0;
        }
        .summary {
          font-style: italic;
          margin-bottom: 25px;
          font-size: 11pt;
        }
        .job {
          margin-bottom: 20px;
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 11pt;
        }
        .company {
          color: #0052cc;
        }
        .job-list {
          margin: 5px 0 0 0;
          padding-left: 18px;
          font-size: 10.5pt;
        }
        .innovation {
          background: #eef4ff;
          border-left: 4px solid #0052cc;
          padding: 8px 12px;
          margin: 10px 0;
          font-size: 10pt;
        }
        @media print {
          .resume-print {
            background: white;
          }
          .container {
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 10px;
            border-radius: 0;
          }
          .sidebar {
            background: #fff;
            border-right: 1px solid #eee;
          }
        }
      `}</style>
      <div className="container">
        <header>
          <h1>{personal.name}</h1>
          <div className="subtitle">{personal.title}</div>
        </header>

        <aside className="sidebar">
          <h3>Contact</h3>
          <ul>
            <li>
              <MapPin />
              {contact.location}
            </li>
            <li>
              <Mail />
              {contact.email}
            </li>
            <li>
              <Phone />
              {contact.phone}
            </li>
          </ul>

          <h3>Technical Stack</h3>
          <ul>
            <li>
              <strong>Languages:</strong> {skills.languages.join(', ')}
            </li>
            <li>
              <strong>Frameworks:</strong> {skills.frameworks.join(', ')}
            </li>
            <li>
              <strong>Data:</strong> {skills.data.join(', ')}
            </li>
            <li>
              <strong>Tools:</strong> {skills.tools.join(', ')}
            </li>
          </ul>

          <h3>Education</h3>
          <ul>
            <li>
              <strong>{resume.education.degree}</strong>
            </li>
            <li>{resume.education.school}</li>
          </ul>

          <h3>Publications</h3>
          <p>
            <em>{resume.publication.title}:</em> {resume.publication.description}
          </p>

          <h3>Engineering &amp; IoT</h3>
          <ul style={{ fontSize: '9.5pt', marginTop: '8px' }}>
            {engineering.items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                <strong>{item.label}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </aside>

        <main className="main">
          <section className="summary">{resume.printSummary}</section>

          <h2>Professional Experience</h2>

          {jobs.map((job, idx) => (
            <div key={idx} className="job">
              <div className="job-header">
                <span>{job.title}</span>
                <span>{job.period}</span>
              </div>
              <div className="company">{job.company}</div>
              <ul className="job-list">
                {job.bullets.map((bullet, bulletIdx) => (
                  <li key={bulletIdx}>{bullet}</li>
                ))}
              </ul>
              {job.highlight && (
                <div className="innovation">
                  <strong>AI Leadership:</strong> {job.highlight.replace(/^AI Innovation: /, '')}
                </div>
              )}
            </div>
          ))}

          <h2>References</h2>
          <p style={{ fontSize: '10.5pt' }}>Available upon request</p>
        </main>
      </div>
    </div>
  );
}
