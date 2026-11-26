'use client';

import { ObfuscatedEmail, ObfuscatedPhone } from '@/components/ObfuscatedContact';
import { ShortSummary, type ShortSummaryData } from '@/components/ShortSummary';
import { postInsightEvent } from '@/lib/site-analytics';
import { motion } from 'framer-motion';
import { ChevronDown, FileDown, FileText, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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

/** Items per stack column before "More". */
const STACK_PREVIEW = 5;

type Branding = {
  primary: string;
  secondary: string;
  highlight: string;
};

type ResumePageData = {
  summary: string;
  summaryHighlight1: string;
  summaryHighlight2: string;
  summaryHighlight3: string;
  shortSummary: ShortSummaryData;
  subtitle: string;
  education: { degree: string; school: string; schoolMotto: string; notes: string };
  publication: { title: string; publisher: string; url?: string; description: string };
};

type WorkExperience = {
  title: string;
  company: string;
  period: string;
  bullets: string[];
  highlight?: string;
  note?: string;
  isLongTenure: boolean;
}[];

type Skills = {
  languages: string[];
  frameworks: string[];
  data: string[];
  tools: string[];
};

type Engineering = {
  title: string;
  items: { label: string; description: string }[];
};

export function ResumeView({
  personalName,
  personalTitle,
  location,
  branding,
  resume,
  jobs,
  skills,
  engineering,
}: {
  personalName: string;
  personalTitle: string;
  location: string;
  branding: Branding;
  resume: ResumePageData;
  jobs: WorkExperience;
  skills: Skills;
  engineering: Engineering;
}) {
  const pathname = usePathname();
  const previewResumeHref = '/resume/print';

  useEffect(() => {
    if (pathname !== '/resume') return;
    const from =
      typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jm_resume_from') : null;
    postInsightEvent({
      event: 'resume_view',
      page: '/resume',
      from_page: from || null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
    });
  }, [pathname]);

  const publication = resume.publication;
  const [stackOpen, setStackOpen] = useState(false);
  const stackGroups = [
    { title: 'Languages', items: skills.languages },
    { title: 'Frameworks', items: skills.frameworks },
    { title: 'Data', items: skills.data },
    { title: 'Tools & Methods', items: skills.tools },
  ];
  const stackHidden = stackGroups.reduce(
    (n, g) => n + Math.max(0, g.items.length - STACK_PREVIEW),
    0
  );
  const pill =
    'border-steel bg-surface text-accent-csharp rounded border px-2 py-0.5 font-mono text-xs';

  return (
    <>
      <div className="w-full px-0 py-8 sm:py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div
            variants={itemVariants}
            className="border-steel mb-8 border-b pb-6 text-left sm:mb-10"
          >
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-accent mb-1 font-mono text-[10px] tracking-[0.2em] uppercase sm:text-xs">
                  Resume
                </p>
                <h1 className="text-foreground font-mono text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  {personalName}
                </h1>
              </div>
              <a
                href={previewResumeHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download resume PDF"
                className="btn-glass text-foreground gap-2 self-start px-4 py-2 sm:px-6"
                onClick={() => {
                  const from =
                    typeof sessionStorage !== 'undefined'
                      ? sessionStorage.getItem('jm_resume_from')
                      : null;
                  postInsightEvent({
                    event: 'resume_preview',
                    page: '/resume',
                    from_page: from || null,
                    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
                    device:
                      typeof window !== 'undefined' && window.innerWidth < 768
                        ? 'mobile'
                        : 'desktop',
                  });
                }}
              >
                <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                <span>Download PDF</span>
              </a>
            </div>
            <p className="text-foreground mb-1 text-base font-medium sm:text-lg">{personalTitle}</p>
            <p className="text-foreground-muted font-mono text-xs sm:text-sm">{resume.subtitle}</p>
          </motion.div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 md:col-span-2">
              <h2 className="text-accent mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                Summary
              </h2>
              <ShortSummary
                summary={resume.shortSummary}
                classes={{
                  headline: 'text-foreground mb-3 text-base font-semibold sm:text-lg',
                  list: 'grid gap-2 sm:grid-cols-2',
                  item: 'text-foreground-muted flex items-center gap-2.5 text-sm sm:text-base',
                  icon: 'text-accent h-4 w-4 shrink-0',
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6">
              <h2 className="text-accent mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                Education
              </h2>
              <p className="text-foreground text-sm font-medium sm:text-base">
                {resume.education.degree}
              </p>
              <p className="text-foreground-muted text-sm">{resume.education.school}</p>
              {resume.education.notes.trim() ? (
                <p className="text-foreground-muted mt-2 text-xs leading-relaxed sm:text-sm">
                  {resume.education.notes}
                </p>
              ) : null}
              <div className="no-print mt-1 space-y-0.5">
                <p className="text-xs" style={{ color: branding.highlight }}>
                  {resume.education.schoolMotto}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6">
              <h2 className="text-accent mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                Contact
              </h2>
              <div className="space-y-2 text-sm">
                <ObfuscatedEmail className="text-foreground-muted hover:text-accent flex items-center gap-2 transition-colors" />
                <ObfuscatedPhone className="text-foreground-muted hover:text-accent flex items-center gap-2 transition-colors" />
                <span className="text-foreground-muted flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 md:col-span-2">
              <h2 className="text-accent mb-4 font-mono text-[10px] tracking-[0.18em] uppercase">
                Technical stack
              </h2>
              <div id="resume-stack" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stackGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">
                      {group.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {(stackOpen ? group.items : group.items.slice(0, STACK_PREVIEW)).map(
                        (skill) => (
                          <span key={skill} className={pill}>
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {stackHidden > 0 ? (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="text-accent inline-flex items-center gap-1 font-mono text-xs hover:underline"
                    aria-expanded={stackOpen}
                    aria-controls="resume-stack"
                    onClick={() => setStackOpen((open) => !open)}
                  >
                    {stackOpen ? 'Less' : `More (+${stackHidden})`}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${stackOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                </div>
              ) : null}
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 md:col-span-2">
              <h3
                className="mb-2 text-xl font-bold sm:text-2xl"
                style={{ color: branding.secondary }}
              >
                {engineering.title}
              </h3>
              <ul className="ml-5 list-disc space-y-2 text-sm sm:text-base">
                {engineering.items.map((item, idx) => (
                  <li key={idx} className="text-foreground-muted">
                    <strong style={{ color: branding.primary }}>{item.label}:</strong>{' '}
                    {item.description}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 md:col-span-2">
              <h2 className="text-accent mb-4 font-mono text-[10px] tracking-[0.18em] uppercase sm:mb-6">
                Work history
              </h2>
              <div className="space-y-6 sm:space-y-8">
                {jobs.map((job, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="border-steel relative border-l-2 pl-4 sm:pl-6"
                    style={job.isLongTenure ? { borderLeftColor: branding.highlight } : undefined}
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
                    {job.highlight ? (
                      <p className="text-foreground-muted mb-2 font-mono text-xs">
                        {job.highlight}
                      </p>
                    ) : null}
                    {job.note ? (
                      <p className="text-foreground-muted mb-2 font-mono text-xs">{job.note}</p>
                    ) : null}
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
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 md:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="text-accent h-4 w-4" />
                <h2 className="text-accent font-mono text-[10px] tracking-[0.18em] uppercase">
                  Publications
                </h2>
              </div>
              <p className="text-foreground text-sm font-medium sm:text-base">
                {publication.url ? (
                  <a
                    href={publication.url}
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {publication.title}
                  </a>
                ) : (
                  publication.title
                )}
              </p>
              {publication.publisher ? (
                <p className="text-foreground-muted text-xs sm:text-sm">{publication.publisher}</p>
              ) : null}
              <p className="text-foreground-muted mt-1 text-xs sm:text-sm">
                {publication.description}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
