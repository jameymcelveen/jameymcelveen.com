'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const jobs = [
  {
    title: 'Senior Software Engineer',
    company: 'SecureGive.com',
    period: 'Sept 2023 – July 2025',
    bullets: [
      'Architected high-performance client-facing API using Snowflake and .NET Core API Gateway',
      'Developed full-stack features using Scala, Angular, and React Native',
      'Integrated Cursor AI protocols into the development lifecycle, increasing sprint velocity by ~30%',
    ],
    highlight: 'AI Innovation: Pioneered AI-augmented development workflows',
  },
  {
    title: 'Senior Software Developer',
    company: 'McLeod Health',
    period: 'Sept 2021 – July 2023',
    bullets: [
      'Modernized legacy C# codebases to .NET Core standards for critical HR and healthcare infrastructure',
      'Introduced Git SCM and CI/CD to the organization for the first time',
      'Mentored interns using Agile methodologies to ensure seamless integration and quality code output',
    ],
  },
  {
    title: 'Programming Manager',
    company: 'ACS Technologies',
    period: 'May 1996 – Feb 2021',
    bullets: [
      'Directed an R&D department of 20+ developers, managing hiring, mentorship, and product roadmaps',
      'Led the engineering of Realm, a flagship C# .NET MVC application serving 50,000+ churches',
      'Pioneered ChurchLife in 2008, one of the first 100 apps on the Apple App Store',
    ],
    isLongTenure: true,
  },
];

const skills = {
  languages: ['C#', 'JavaScript', 'TypeScript', 'HTML', 'Scala'],
  frameworks: ['.NET Core', 'ASP.NET MVC', 'React', 'React Native', 'Angular', 'Vue.js', 'Next.js'],
  data: ['Snowflake', 'PostgreSQL', 'MSSQL', 'Oracle Cloud'],
  tools: ['Cursor AI', 'Git', 'CI/CD', 'Agile/Scrum'],
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="text-gradient mb-2 text-4xl font-bold sm:text-5xl">Resume</h1>
          <p className="text-foreground-muted">25+ years of engineering excellence</p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* Summary - spans 2 cols */}
          <motion.div variants={itemVariants} className="glass-card p-6 md:col-span-2">
            <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
              Summary
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              Senior Software Architect with 25+ years of experience in{' '}
              <span className="text-foreground">Christian tech</span> and{' '}
              <span className="text-foreground">fintech</span>. Expert in architecting scalable
              solutions for platforms serving 50,000+ organizations. Specialist in{' '}
              <span className="text-accent">AI-augmented engineering workflows</span> to maximize
              developer velocity and code quality.
            </p>
          </motion.div>

          {/* Education */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
              Education
            </h2>
            <p className="text-foreground font-medium">B.S. Computer Engineering</p>
            <p className="text-foreground-muted">Clemson University</p>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
              Contact
            </h2>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:jamey@mcelveen.us"
                className="text-foreground-muted hover:text-accent block"
              >
                📧 jamey@mcelveen.us
              </a>
              <a href="tel:+18436188078" className="text-foreground-muted hover:text-accent block">
                📞 (843) 618-8078
              </a>
              <p className="text-foreground-muted">📍 Timmonsville, SC</p>
            </div>
          </motion.div>

          {/* Technical Skills - spans full width */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-6 md:col-span-3 lg:col-span-4"
          >
            <h2 className="text-accent mb-4 font-mono text-xs tracking-widest uppercase">
              Technical Stack
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="text-foreground mb-2 text-sm font-medium">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((skill) => (
                    <span
                      key={skill}
                      className="bg-accent/10 text-accent rounded-md px-2 py-1 font-mono text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-sm font-medium">Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.frameworks.map((skill) => (
                    <span
                      key={skill}
                      className="bg-accent-secondary/10 text-accent-secondary rounded-md px-2 py-1 font-mono text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-sm font-medium">Data</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.data.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-pink-500/10 px-2 py-1 font-mono text-xs text-pink-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-sm font-medium">Tools & Methods</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Work Experience - individual cards */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-6 md:col-span-3 lg:col-span-4"
          >
            <h2 className="text-accent mb-6 font-mono text-xs tracking-widest uppercase">
              Work History
            </h2>
            <div className="space-y-8">
              {jobs.map((job, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`relative border-l-2 pl-6 ${
                    job.isLongTenure ? 'border-accent' : 'border-glass-border'
                  }`}
                >
                  <div className="bg-background absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-current" />
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-foreground text-lg font-semibold">{job.title}</h3>
                      <p className="text-accent">{job.company}</p>
                    </div>
                    <span className="text-foreground-muted font-mono text-sm">{job.period}</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {job.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="text-foreground-muted flex gap-3 text-sm">
                        <span className="bg-foreground-muted mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  {job.highlight && (
                    <div className="border-accent bg-accent/5 mt-4 rounded-lg border-l-4 p-3 text-sm">
                      <span className="text-accent font-medium">✨ {job.highlight}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Publication */}
          <motion.div variants={itemVariants} className="glass-card p-6 md:col-span-2">
            <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
              Publications
            </h2>
            <p className="text-foreground font-medium">iPhone Game Development</p>
            <p className="text-foreground-muted text-sm">
              A technical and business guide to creating and selling iPhone games
            </p>
          </motion.div>

          {/* Download / Print */}
          <motion.div
            variants={itemVariants}
            className="glass-card flex items-center justify-center p-6 md:col-span-1 lg:col-span-2"
          >
            <button
              onClick={() => window.print()}
              className="bg-accent/10 text-accent hover:bg-accent/20 flex items-center gap-2 rounded-full px-6 py-2 font-medium transition-colors"
            >
              <span>📄</span> Print Resume
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
