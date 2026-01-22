'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ObfuscatedEmail, ObfuscatedPhone } from '@/components/ObfuscatedContact';
import { Sparkles, FileText, MapPin } from 'lucide-react';

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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 text-center sm:mb-12">
          <h1 className="text-gradient mb-2 text-3xl font-bold sm:text-4xl md:text-5xl">Resume</h1>
          <p className="text-foreground-muted text-sm sm:text-base">
            25+ years of engineering excellence
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Summary - spans 2 cols */}
          <motion.div
            variants={itemVariants}
            className="liquid-glass-resume glass-card p-4 sm:p-6 md:col-span-2"
          >
            <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
              Summary
            </h2>
            <p className="text-foreground-muted text-sm leading-relaxed sm:text-base">
              Senior Software Architect with 25+ years of experience in{' '}
              <span className="text-foreground">Christian tech</span> and{' '}
              <span className="text-foreground">fintech</span>. Expert in architecting scalable
              solutions for platforms serving 50,000+ organizations. Specialist in{' '}
              <span className="text-clemson-orange">AI-augmented engineering workflows</span> to
              maximize developer velocity and code quality.
            </p>
          </motion.div>

          {/* Education */}
          <motion.div
            variants={itemVariants}
            className="liquid-glass-resume glass-card p-4 sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-accent font-mono text-xs tracking-widest uppercase">
                Education
              </h2>
              <Image
                src="/clemson-tigers-logo.svg"
                alt="Clemson Tigers"
                width={24}
                height={24}
                className="no-print h-6 w-6 opacity-40"
              />
            </div>
            <p className="text-foreground text-sm font-medium sm:text-base">
              B.S. Computer Engineering
            </p>
            <p className="text-foreground-muted text-sm">Clemson University</p>
            <p className="text-clemson-orange mt-1 text-xs">🐅 Go Tigers!</p>
          </motion.div>

          {/* Contact - obfuscated */}
          <motion.div
            variants={itemVariants}
            className="liquid-glass-resume glass-card p-4 sm:p-6"
          >
            <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
              Contact
            </h2>
            <div className="space-y-2 text-sm">
              <ObfuscatedEmail className="text-foreground-muted hover:text-accent block transition-colors" />
              <ObfuscatedPhone className="text-foreground-muted hover:text-accent block transition-colors" />
              <span className="text-foreground-muted flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Timmonsville, SC
              </span>
            </div>
          </motion.div>

          {/* Technical Skills - spans full width */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-4 sm:p-6 md:col-span-2 lg:col-span-4"
          >
            <h2 className="text-accent mb-4 font-mono text-xs tracking-widest uppercase">
              Technical Stack
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div>
                <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">Languages</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {skills.languages.map((skill) => (
                    <span
                      key={skill}
                      className="bg-accent/10 text-accent rounded-md px-2 py-0.5 font-mono text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">Frameworks</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {skills.frameworks.map((skill) => (
                    <span
                      key={skill}
                      className="bg-accent-secondary/10 text-accent-secondary rounded-md px-2 py-0.5 font-mono text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">Data</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {skills.data.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-purple-500/10 px-2 py-0.5 font-mono text-xs text-purple-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">
                  Tools &amp; Methods
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {skills.tools.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI/Cursor Skills Section - Liquid Glass */}
          <motion.div
            variants={itemVariants}
            className="liquid-glass p-4 sm:p-6 md:col-span-2 lg:col-span-4"
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="text-clemson-orange h-5 w-5" />
              <h2 className="text-accent font-mono text-xs tracking-widest uppercase">
                AI-Augmented Development
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-foreground-muted text-sm leading-relaxed sm:text-base">
                Using AI tools like <span className="text-clemson-orange font-medium">Cursor</span>{' '}
                to improve development velocity by{' '}
                <span className="text-clemson-orange font-semibold">~30%</span> while maintaining
                high code quality and architectural standards.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-clemson-orange/10 text-clemson-orange rounded-md px-2 py-1 font-mono text-xs">
                  Cursor AI
                </span>
                <span className="bg-clemson-orange/10 text-clemson-orange rounded-md px-2 py-1 font-mono text-xs">
                  AI Code Generation
                </span>
                <span className="bg-clemson-orange/10 text-clemson-orange rounded-md px-2 py-1 font-mono text-xs">
                  Automated Testing
                </span>
                <span className="bg-clemson-orange/10 text-clemson-orange rounded-md px-2 py-1 font-mono text-xs">
                  Code Review AI
                </span>
              </div>
            </div>
          </motion.div>

          {/* Work Experience - individual cards */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-4 sm:p-6 md:col-span-2 lg:col-span-4"
          >
            <h2 className="text-accent mb-4 font-mono text-xs tracking-widest uppercase sm:mb-6">
              Work History
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {jobs.map((job, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`relative border-l-2 pl-4 sm:pl-6 ${
                    job.isLongTenure ? 'border-clemson-orange' : 'border-glass-border'
                  }`}
                >
                  <div className="bg-background absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-current" />
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-2">
                    <div>
                      <h3 className="text-foreground text-base font-semibold sm:text-lg">
                        {job.title}
                      </h3>
                      <p className="text-accent text-sm">{job.company}</p>
                    </div>
                    <span className="text-foreground-muted font-mono text-xs sm:text-sm">
                      {job.period}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {job.bullets.map((bullet, bulletIdx) => (
                      <li
                        key={bulletIdx}
                        className="text-foreground-muted flex gap-2 text-xs sm:gap-3 sm:text-sm"
                      >
                        <span className="bg-foreground-muted mt-1.5 h-1 w-1 shrink-0 rounded-full sm:h-1.5 sm:w-1.5" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  {job.highlight && (
                    <div className="border-clemson-orange bg-clemson-orange/5 mt-3 rounded-lg border-l-4 p-2 text-xs sm:mt-4 sm:p-3 sm:text-sm">
                      <span className="text-clemson-orange font-medium">✨ {job.highlight}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Publication */}
          <motion.div
            variants={itemVariants}
            className="liquid-glass-resume glass-card p-4 sm:p-6 md:col-span-2"
          >
            <div className="mb-3 flex items-center gap-2">
              <FileText className="text-accent h-4 w-4" />
              <h2 className="text-accent font-mono text-xs tracking-widest uppercase">
                Publications
              </h2>
            </div>
            <p className="text-foreground text-sm font-medium sm:text-base">
              iPhone Game Development
            </p>
            <p className="text-foreground-muted text-xs sm:text-sm">
              A technical and business guide to creating and selling iPhone games
            </p>
          </motion.div>

          {/* Download / Print */}
          <motion.div
            variants={itemVariants}
            className="glass-card no-print flex items-center justify-center p-4 sm:p-6 md:col-span-2"
          >
            <button
              onClick={() => window.print()}
              className="bg-accent/10 text-accent hover:bg-accent/20 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6"
            >
              <FileText className="h-4 w-4" />
              Print Resume
            </button>
          </motion.div>

          {/* References - Print Only */}
          <motion.div
            variants={itemVariants}
            className="print-only glass-card hidden p-4 sm:p-6 md:col-span-2 lg:col-span-4"
          >
            <h2 className="text-accent mb-2 font-mono text-xs tracking-widest uppercase">
              References
            </h2>
            <p className="text-foreground-muted text-sm">Available upon request</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
