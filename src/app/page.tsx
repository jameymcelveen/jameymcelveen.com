'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, type ReactElement } from 'react';
import { ObfuscatedEmail, ObfuscatedPhone } from '@/components/ObfuscatedContact';
import { SecretLock } from '@/components/PinGate';
import { CurrentlyBuilding, type HomeProjectCard } from '@/components/home/CurrentlyBuilding';
import { HomeHeroBackdrop } from '@/components/home/HomeHeroBackdrop';
import { HomePolaroidPhoto } from '@/components/home/HomePolaroidPhoto';
import { useAskJameyPanel } from '@/context/AskJameyPanelContext';
import { MapPin } from 'lucide-react';
import { getPersonalInfo, getHomeData, getImages, getBranding } from '@/data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

function AnimatedText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function renderSummaryWithHighlights(
  text: string,
  highlight1: string,
  highlight2: string,
  highlight3: string,
  highlightColor: string
) {
  const parts: (string | ReactElement)[] = [];
  let remaining = text;
  let key = 0;

  // Find and replace highlight1
  const idx1 = remaining.indexOf(highlight1);
  if (idx1 >= 0) {
    parts.push(remaining.substring(0, idx1));
    parts.push(
      <span key={key++} className="text-foreground">
        {highlight1}
      </span>
    );
    remaining = remaining.substring(idx1 + highlight1.length);
  } else {
    parts.push(remaining);
    remaining = '';
  }

  // Find and replace highlight2
  if (remaining) {
    const idx2 = remaining.indexOf(highlight2);
    if (idx2 >= 0) {
      parts.push(remaining.substring(0, idx2));
      parts.push(
        <span key={key++} className="text-foreground">
          {highlight2}
        </span>
      );
      remaining = remaining.substring(idx2 + highlight2.length);
    } else {
      parts.push(remaining);
      remaining = '';
    }
  }

  // Find and replace highlight3
  if (remaining) {
    const idx3 = remaining.indexOf(highlight3);
    if (idx3 >= 0) {
      parts.push(remaining.substring(0, idx3));
      parts.push(
        <span key={key++} style={{ color: highlightColor }}>
          {highlight3}
        </span>
      );
      parts.push(remaining.substring(idx3 + highlight3.length));
    } else {
      parts.push(remaining);
    }
  }

  return parts;
}

export default function Home() {
  const [showCoverLetters, setShowCoverLetters] = useState(false);
  const { openAskJamey } = useAskJameyPanel();
  const personal = getPersonalInfo();
  const home = getHomeData();
  const images = getImages();
  const branding = getBranding();
  const projects = (home as { projects?: HomeProjectCard[] }).projects ?? [];
  const askJameyCtaLine = (home as { askJameyCtaLine?: string }).askJameyCtaLine;
  const askJameyCta =
    (home as { askJameyCta?: string }).askJameyCta;

  // Check if already unlocked on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('cover-letters-auth');
    if (stored === 'true') {
      setShowCoverLetters(true);
    }
  }, []);

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center py-8 sm:py-12">
      <HomeHeroBackdrop />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-0 w-full max-w-3xl text-center"
      >
        {/* Polaroid photo */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex justify-center pt-8 sm:mb-8 sm:pt-12"
        >
          <HomePolaroidPhoto alt={images.photoAlt} />
        </motion.div>

        {/* Greeting */}
        <motion.p
          variants={itemVariants}
          className="text-[var(--text-muted)] mb-4 font-mono text-xs tracking-widest uppercase sm:text-sm"
        >
          {personal.greeting}
        </motion.p>

        {/* Name with kinetic typography */}
        <h1 className="hero-name-display hero-name-h1 mb-4 sm:mb-6">
          <AnimatedText text={personal.name} className="text-gradient" />
        </h1>

        {/* Title + tagline */}
        <motion.h2
          variants={itemVariants}
          className="text-foreground-muted mb-3 text-lg leading-snug tracking-tight sm:mb-4 sm:text-xl md:text-2xl"
        >
          <span className="text-foreground font-semibold">
            {'headlinePrimary' in personal && typeof personal.headlinePrimary === 'string'
              ? personal.headlinePrimary
              : 'Principal Systems Architect'}
          </span>
          <span className="text-foreground-muted font-normal">
            {'headlineSecondary' in personal && typeof personal.headlineSecondary === 'string'
              ? personal.headlineSecondary
              : ' · 30+ years Enterprise Architecture · O\'Reilly Author'}
          </span>
        </motion.h2>
        {personal.subtitle ? (
          <motion.p
            variants={itemVariants}
            className="text-foreground-muted mb-6 text-sm sm:mb-8 sm:text-base"
          >
            {personal.subtitle}
          </motion.p>
        ) : (
          <div className="mb-6 sm:mb-8" />
        )}

        {/* Ask Jamey CTA — directly under tagline */}
        <motion.div variants={itemVariants} className="mb-8 text-center sm:mb-10">
          <p className="text-foreground-muted mb-2 text-sm sm:text-base">
            {askJameyCtaLine ?? 'Have a question about my experience?'}
          </p>
          <button
            type="button"
            onClick={openAskJamey}
            className="text-[var(--accent-blue)] hover:text-[color-mix(in_oklch,var(--accent-blue)_88%,white)] font-mono text-sm font-medium tracking-wide underline-offset-4 transition-colors hover:underline"
          >
            {askJameyCta ?? 'Ask Jamey →'}
          </button>
        </motion.div>

        {/* Summary */}
        <motion.div
          variants={itemVariants}
          className="glass-callout text-foreground-muted mx-auto mb-10 max-w-2xl rounded-[var(--radius-card)] px-6 py-6 text-left text-base leading-[1.65] sm:mb-12 sm:px-8 sm:py-8 sm:text-lg"
        >
          {renderSummaryWithHighlights(
            home.summary,
            home.summaryHighlight1,
            home.summaryHighlight2,
            home.summaryHighlight3,
            branding.highlight
          )}
        </motion.div>

        {projects.length > 0 ? (
          <motion.div variants={itemVariants} className="mx-auto flex w-full justify-center">
            <CurrentlyBuilding projects={projects} />
          </motion.div>
        ) : null}

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link href="/resume" className="btn-resume-outline">
            <span>View resume</span>
          </Link>

          {/* Cover letters button - positioned correctly */}
          {showCoverLetters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              <Link
                href="/cover-letters"
                className="glass-card text-foreground hover:border-accent/40 rounded-md px-6 py-2.5 font-medium hover:bg-surface sm:px-8 sm:py-3"
              >
                Cover Letters
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Tech stack badges */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap justify-center gap-2 sm:mt-16 sm:gap-3"
        >
          {home.techStack.map((tech) => (
            <span
              key={tech}
              className="tech-stack-pill-v3"
            >
              {tech}
            </span>
          ))}
        </motion.div>

        {/* Contact links - obfuscated */}
        <motion.div
          variants={itemVariants}
          className="text-foreground-muted mt-8 flex flex-col items-center gap-3 text-sm sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6"
        >
          <ObfuscatedEmail className="hover:text-accent flex items-center transition-colors" />
          <ObfuscatedPhone className="hover:text-accent flex items-center transition-colors" />
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {personal.location}
          </span>
        </motion.div>
      </motion.div>

      {/* Secret lock icon - always visible, can hide/show cover letters */}
      <SecretLock
        onUnlock={() => setShowCoverLetters(true)}
        onLock={() => setShowCoverLetters(false)}
      />
    </div>
  );
}
