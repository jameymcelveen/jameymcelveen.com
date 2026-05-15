'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ObfuscatedEmail, ObfuscatedPhone } from '@/components/ObfuscatedContact';
import { Eye, FileText, MapPin } from 'lucide-react';
import {
  getResumeData,
  getWorkExperience,
  getSkills,
  getEngineering,
  getContactInfo,
  getBranding,
  getPersonalInfo,
} from '@/data';
import { postInsightEvent } from '@/lib/site-analytics';

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

export default function ResumePage() {
  const pathname = usePathname();
  const resume = getResumeData();
  const jobs = getWorkExperience();
  const skills = getSkills();
  const engineering = getEngineering();
  const contact = getContactInfo();
  const branding = getBranding();
  const personal = getPersonalInfo();

  const previewResumeHref = '/resume/index.html';

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

  const publication = resume.publication as {
    title: string;
    description: string;
    publisher?: string;
  };

  return (
    <>
      <div className="fixed top-14 right-4 z-50 flex items-center sm:right-6 sm:top-14">
        <a
          href={previewResumeHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open résumé preview in a new tab"
          className="btn-glass text-foreground gap-2 px-4 py-2 sm:px-6"
          onClick={() => {
            const from =
              typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jm_resume_from') : null;
            postInsightEvent({
              event: 'resume_preview',
              page: '/resume',
              from_page: from || null,
              referrer: typeof document !== 'undefined' ? document.referrer || null : null,
              device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
            });
          }}
        >
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
          <span>Preview</span>
        </a>
      </div>

      <div className="w-full px-0 py-8 sm:py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="mb-8 border-b border-steel pb-6 text-left sm:mb-10">
            <p className="text-accent mb-1 font-mono text-[10px] tracking-[0.2em] uppercase sm:text-xs">
              Résumé
            </p>
            <h1 className="text-foreground mb-2 font-mono text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {personal.name}
            </h1>
            <p className="text-foreground mb-1 text-base font-medium sm:text-lg">{personal.title}</p>
            <p className="text-foreground-muted font-mono text-xs sm:text-sm">{resume.subtitle}</p>
          </motion.div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="liquid-glass-resume glass-card p-4 sm:p-6 md:col-span-2"
            >
              <h2 className="text-accent mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                Summary
              </h2>
              <p className="text-foreground-muted text-sm leading-relaxed sm:text-base">
                {resume.summary
                  .replace(resume.summaryHighlight1, `__H1__${resume.summaryHighlight1}__H1__`)
                  .replace(resume.summaryHighlight2, `__H2__${resume.summaryHighlight2}__H2__`)
                  .replace(resume.summaryHighlight3, `__H3__${resume.summaryHighlight3}__H3__`)
                  .split('__H1__')
                  .map((part, i) => {
                    if (part.includes('__H2__')) {
                      return part.split('__H2__').map((p, j) => {
                        if (p.includes('__H3__')) {
                          return p.split('__H3__').map((p2, k) =>
                            k % 2 === 1 ? (
                              <span
                                key={`${i}-${j}-${k}`}
                                style={{ color: branding.highlight }}
                              >
                                {p2}
                              </span>
                            ) : (
                              p2
                            )
                          );
                        }
                        return j % 2 === 1 ? (
                          <span key={`${i}-${j}`} className="text-foreground">
                            {p}
                          </span>
                        ) : (
                          p
                        );
                      });
                    }
                    return i % 2 === 1 ? (
                      <span key={i} className="text-foreground">
                        {part}
                      </span>
                    ) : (
                      part
                    );
                  })}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="liquid-glass-resume glass-card p-4 sm:p-6"
            >
              <h2 className="text-accent mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                Education
              </h2>
              <p className="text-foreground text-sm font-medium sm:text-base">
                {resume.education.degree}
              </p>
              <p className="text-foreground-muted text-sm">{resume.education.school}</p>
              {'notes' in resume.education &&
              typeof (resume.education as { notes?: string }).notes === 'string' &&
              (resume.education as { notes: string }).notes.trim() ? (
                <p className="text-foreground-muted mt-2 text-xs leading-relaxed sm:text-sm">
                  {(resume.education as { notes: string }).notes}
                </p>
              ) : null}
              <div className="no-print mt-1 space-y-0.5">
                <p className="text-xs" style={{ color: branding.highlight }}>
                  {resume.education.schoolMotto}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="liquid-glass-resume glass-card p-4 sm:p-6"
            >
              <h2 className="text-accent mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                Contact
              </h2>
              <div className="space-y-2 text-sm">
                <ObfuscatedEmail className="text-foreground-muted hover:text-accent flex items-center gap-2 transition-colors" />
                <ObfuscatedPhone className="text-foreground-muted hover:text-accent flex items-center gap-2 transition-colors" />
                <span className="text-foreground-muted flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {contact.location}
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-card p-4 sm:p-6 md:col-span-2"
            >
              <h2 className="text-accent mb-4 font-mono text-[10px] tracking-[0.18em] uppercase">
                Technical stack
              </h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div>
                  <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {skills.languages.map((skill) => (
                      <span
                        key={skill}
                        className="border-steel bg-surface text-accent-csharp rounded border px-2 py-0.5 font-mono text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">
                    Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {skills.frameworks.map((skill) => (
                      <span
                        key={skill}
                        className="border-steel bg-surface text-accent-csharp rounded border px-2 py-0.5 font-mono text-xs"
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
                        className="border-steel bg-surface text-accent-csharp rounded border px-2 py-0.5 font-mono text-xs"
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
                        className="border-steel bg-surface text-accent-csharp rounded border px-2 py-0.5 font-mono text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 md:col-span-2">
              <h3
                className="text-xl font-bold mb-2 sm:text-2xl"
                style={{ color: branding.secondary }}
              >
                {engineering.title}
              </h3>
              <ul className="list-disc ml-5 space-y-2 text-sm sm:text-base">
                {engineering.items.map((item, idx) => (
                  <li key={idx} className="text-foreground-muted">
                    <strong style={{ color: branding.primary }}>{item.label}:</strong>{' '}
                    {item.description}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-card p-4 sm:p-6 md:col-span-2"
            >
              <h2 className="text-accent mb-4 font-mono text-[10px] tracking-[0.18em] uppercase sm:mb-6">
                Work history
              </h2>
              <div className="space-y-6 sm:space-y-8">
                {jobs.map((job, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="border-steel relative border-l-2 pl-4 sm:pl-6"
                    style={
                      job.isLongTenure
                        ? { borderLeftColor: branding.highlight }
                        : undefined
                    }
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
                      <div
                        className="mt-3 rounded-lg border-l-4 p-2 text-xs sm:mt-4 sm:p-3 sm:text-sm"
                        style={{
                          borderLeftColor: branding.highlight,
                          backgroundColor: `${branding.highlight}0d`,
                        }}
                      >
                        <span style={{ color: branding.highlight }} className="font-medium">
                          ✨ {job.highlight}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="liquid-glass-resume glass-card p-4 sm:p-6 md:col-span-2"
            >
              <div className="mb-3 flex items-center gap-2">
                <FileText className="text-accent h-4 w-4" />
                <h2 className="text-accent font-mono text-[10px] tracking-[0.18em] uppercase">
                  Publications
                </h2>
              </div>
              <p className="text-foreground text-sm font-medium sm:text-base">
                {publication.title}
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
