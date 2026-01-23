'use client';

import { Mail, Phone, MapPin } from 'lucide-react';

export default function ResumePrintPage() {
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
          <h1>Jamey McElveen</h1>
          <div className="subtitle">Senior Software Architect & Engineering Leader</div>
        </header>

        <aside className="sidebar">
          <h3>Contact</h3>
          <ul>
            <li>
              <MapPin />
              Timmonsville, SC
            </li>
            <li>
              <Mail />
              jamey@mcelveen.us
            </li>
            <li>
              <Phone />
              (843) 618-8078
            </li>
          </ul>

          <h3>Technical Stack</h3>
          <ul>
            <li>
              <strong>Languages:</strong> C#, JavaScript, TypeScript, Scala, HTML
            </li>
            <li>
              <strong>Frameworks:</strong> .NET Core, ASP.NET MVC, React, Next.js, Angular,
              Vue.js
            </li>
            <li>
              <strong>Data:</strong> Snowflake, PostgreSQL, MSSQL, Oracle Cloud
            </li>
            <li>
              <strong>Tools:</strong> Cursor AI, CI/CD, Git, Agile/Scrum
            </li>
          </ul>

          <h3>Education</h3>
          <ul>
            <li>
              <strong>B.S. Computer Engineering</strong>
            </li>
            <li>Clemson University</li>
          </ul>

          <h3>Publications</h3>
          <p>
            <em>iPhone Game Development:</em> A technical and business guide
          </p>
        </aside>

        <main className="main">
          <section className="summary">
            Software Architect with 25+ years of experience specializing in high-scale platforms
            and modern development workflows. Proven track record of leading teams of 20+ and
            architecting solutions for over 50,000 organizations. Specialist in AI-augmented
            engineering to maximize delivery velocity.
          </section>

          <h2>Professional Experience</h2>

          <div className="job">
            <div className="job-header">
              <span>Senior Software Engineer</span>
              <span>Sept 2023 – July 2025</span>
            </div>
            <div className="company">SecureGive.com</div>
            <ul className="job-list">
              <li>
                Architected high-performance client-facing API using Snowflake and .NET Core API
                Gateway.
              </li>
              <li>Developed full-stack features using Scala, Angular, and React Native.</li>
            </ul>
            <div className="innovation">
              <strong>AI Leadership:</strong> Integrated Cursor AI into the development lifecycle,
              increasing sprint velocity by ~30% while maintaining high architectural standards.
            </div>
          </div>

          <div className="job">
            <div className="job-header">
              <span>Senior Software Developer</span>
              <span>Sept 2021 – July 2023</span>
            </div>
            <div className="company">McLeod Health</div>
            <ul className="job-list">
              <li>
                Modernized legacy C# codebases to .NET Core standards for critical healthcare
                infrastructure.
              </li>
              <li>Introduced Git SCM and CI/CD to the organization for the first time.</li>
              <li>
                Mentored interns using Agile methodologies to ensure quality code output.
              </li>
            </ul>
          </div>

          <div className="job">
            <div className="job-header">
              <span>Programming Manager</span>
              <span>May 1996 – Feb 2021</span>
            </div>
            <div className="company">ACS Technologies</div>
            <ul className="job-list">
              <li>
                Directed an R&D department of 20+ developers, managing hiring, mentorship, and
                product roadmaps.
              </li>
              <li>
                Led the engineering of &quot;Realm,&quot; a flagship C# .NET MVC application serving
                50,000+ churches.
              </li>
              <li>
                Pioneered &quot;ChurchLife&quot; in 2008, one of the first 100 apps on the Apple
                App Store.
              </li>
            </ul>
          </div>

          <h2>References</h2>
          <p style={{ fontSize: '10.5pt' }}>Available upon request</p>
        </main>
      </div>
    </div>
  );
}
