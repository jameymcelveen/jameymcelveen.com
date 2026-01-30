'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ObfuscatedEmail, ObfuscatedPhone } from '@/components/ObfuscatedContact';
import { Sparkles, FileText, MapPin } from 'lucide-react';
import {
  getResumeData,
  getWorkExperience,
  getSkills,
  getEngineering,
  getAIDevelopment,
  getImages,
  getContactInfo,
  getBranding,
} from '@/data';

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
  const resume = getResumeData();
  const jobs = getWorkExperience();
  const skills = getSkills();
  const engineering = getEngineering();
  const aiDev = getAIDevelopment();
  const images = getImages();
  const contact = getContactInfo();
  const branding = getBranding();

  const handlePrint = () => {
    const printWindow = window.open('/resume/print', '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  return (
    <>
      {/* Sticky print button - centered with nav */}
      <div className="fixed right-4 top-4 z-50 flex items-center sm:right-6 sm:top-6">
        <button
          onClick={handlePrint}
          className="glass-card text-foreground hover:border-accent/30 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 sm:px-6"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Print Resume</span>
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 pt-16 text-center sm:mb-12 sm:pt-20">
            <h1 className="text-gradient mb-2 text-3xl font-bold sm:text-4xl md:text-5xl">
              Resume
            </h1>
            <p className="text-foreground-muted text-sm sm:text-base">
              {resume.subtitle}
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

            {/* Education */}
            <motion.div
              variants={itemVariants}
              className="liquid-glass-resume glass-card p-4 sm:p-6"
            >
              <h2 className="text-accent mb-3 font-mono text-xs tracking-widest uppercase">
                Education
              </h2>
              <p className="text-foreground text-sm font-medium sm:text-base">
                {resume.education.degree}
              </p>
              <p className="text-foreground-muted text-sm">{resume.education.school}</p>
              <div className="no-print mt-1 flex items-center gap-1.5">
                <Image
                  src={images.brandLogo}
                  alt={images.brandLogoAlt}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
                <span className="text-xs" style={{ color: branding.highlight }}>
                  {resume.education.schoolMotto}
                </span>
              </div>
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
                <ObfuscatedEmail className="text-foreground-muted hover:text-accent flex items-center gap-2 transition-colors" />
                <ObfuscatedPhone className="text-foreground-muted hover:text-accent flex items-center gap-2 transition-colors" />
                <span className="text-foreground-muted flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {contact.location}
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
                  <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">
                    Languages
                  </h3>
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
                  <h3 className="text-foreground mb-2 text-xs font-medium sm:text-sm">
                    Frameworks
                  </h3>
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

            {/* Engineering & IoT Prototyping Section */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-4 sm:p-6 md:col-span-2 lg:col-span-4"
              style={{
                borderLeft: `4px solid ${branding.primary}`,
                backgroundColor: `${branding.primary}0d`,
              }}
            >
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

            {/* AI/Cursor Skills Section - Liquid Glass */}
            <motion.div
              variants={itemVariants}
              className="liquid-glass p-4 sm:p-6 md:col-span-2 lg:col-span-4"
            >
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: branding.highlight }} />
                <h2 className="text-accent font-mono text-xs tracking-widest uppercase">
                  {aiDev.title}
                </h2>
              </div>
              <div className="space-y-3">
                <p className="text-foreground-muted text-sm leading-relaxed sm:text-base">
                  {aiDev.description
                    .replace(aiDev.toolName, `__TOOL__${aiDev.toolName}__TOOL__`)
                    .replace(aiDev.velocityIncrease, `__VEL__${aiDev.velocityIncrease}__VEL__`)
                    .split('__TOOL__')
                    .map((part, i) => {
                      if (part.includes('__VEL__')) {
                        return part.split('__VEL__').map((p, j) =>
                          j % 2 === 1 ? (
                            <span
                              key={`${i}-${j}`}
                              style={{ color: branding.highlight }}
                              className="font-semibold"
                            >
                              {p}
                            </span>
                          ) : (
                            p
                          )
                        );
                      }
                      return i % 2 === 1 ? (
                        <span key={i} style={{ color: branding.highlight }} className="font-medium">
                          {part}
                        </span>
                      ) : (
                        part
                      );
                    })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiDev.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-md px-2 py-1 font-mono text-xs"
                      style={{
                        backgroundColor: `${branding.highlight}1a`,
                        color: branding.highlight,
                      }}
                    >
                      {badge}
                    </span>
                  ))}
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
                    className="relative border-l-2 pl-4 sm:pl-6 border-glass-border"
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

            {/* Publication - expanded to full width */}
            <motion.div
              variants={itemVariants}
              className="liquid-glass-resume glass-card p-4 sm:p-6 md:col-span-2 lg:col-span-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <FileText className="text-accent h-4 w-4" />
                <h2 className="text-accent font-mono text-xs tracking-widest uppercase">
                  Publications
                </h2>
              </div>
              <p className="text-foreground text-sm font-medium sm:text-base">
                {resume.publication.title}
              </p>
              <p className="text-foreground-muted text-xs sm:text-sm">
                {resume.publication.description}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
