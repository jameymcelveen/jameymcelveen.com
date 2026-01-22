'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ObfuscatedEmail, ObfuscatedPhone } from '@/components/ObfuscatedContact';
import { SecretLock } from '@/components/PinGate';
import { MapPin, Github } from 'lucide-react';

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
    <span className={`${className} name-shimmer`}>
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

export default function Home() {
  const [showCoverLetters, setShowCoverLetters] = useState(false);

  // Check if already unlocked on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('cover-letters-auth');
    if (stored === 'true') {
      setShowCoverLetters(true);
    }
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center px-4 sm:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center"
      >
        {/* Photo */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex justify-center sm:mb-8"
        >
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-accent/30 sm:h-40 sm:w-40">
            <Image
              src="/jamey-mcelveen.jpg"
              alt="Jamey McElveen"
              width={150}
              height={150}
              className="h-full w-full object-cover"
              style={{
                // Photo is now 150x150px with face centered - use center positioning
                objectPosition: 'center center',
              }}
              priority
            />
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.p
          variants={itemVariants}
          className="text-accent mb-4 font-mono text-xs tracking-widest uppercase sm:text-sm"
        >
          Hello, I&apos;m
        </motion.p>

        {/* Name with kinetic typography */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl">
          <AnimatedText text="Jamey McElveen" className="text-gradient" />
        </h1>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="text-foreground-muted mb-6 text-lg sm:mb-8 sm:text-xl md:text-2xl lg:text-3xl"
        >
          Senior Software Architect &amp;{' '}
          <span className="text-foreground">Engineering Leader</span>
        </motion.h2>

        {/* Summary */}
        <motion.p
          variants={itemVariants}
          className="text-foreground-muted mx-auto mb-8 max-w-2xl text-base leading-relaxed sm:mb-12 sm:text-lg"
        >
          25+ years crafting scalable solutions in{' '}
          <span className="text-foreground">Christian tech</span> and{' '}
          <span className="text-foreground">fintech</span>. Architecting platforms that serve
          50,000+ organizations. Pioneering{' '}
          <span className="text-clemson-orange">AI-augmented engineering</span> workflows.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          <Link
            href="/resume"
            className="liquid-glass-hover glow group bg-accent relative overflow-hidden rounded-full px-6 py-2.5 font-medium text-white transition-all hover:scale-105 sm:px-8 sm:py-3"
          >
            <span className="relative z-10">View Resume</span>
            <span className="bg-accent-secondary absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
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
                className="liquid-glass-hover glass-card text-foreground hover:border-accent/30 rounded-full px-6 py-2.5 font-medium transition-all hover:scale-105 sm:px-8 sm:py-3"
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
          {['C#', '.NET Core', 'React', 'TypeScript', 'Snowflake', 'Cursor AI'].map((tech) => (
            <span
              key={tech}
              className="glass-card text-foreground-muted hover:text-accent rounded-full px-3 py-1 font-mono text-xs transition-colors sm:px-4 sm:py-1.5"
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
            Timmonsville, SC
          </span>
        </motion.div>

        {/* Footer links - GitHub and Cursor */}
        <motion.div
          variants={itemVariants}
          className="text-foreground-muted/60 mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:mt-12"
        >
          <a
            href="https://github.com/jameymcelveen/jameymcelveen.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent flex items-center gap-1.5 transition-colors"
            aria-label="View source code on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>View Source</span>
          </a>
          <span className="text-foreground-muted/40">•</span>
          <span>
            Built with{' '}
            <a
              href="https://cursor.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Cursor
            </a>
          </span>
        </motion.div>
      </motion.div>

      {/* Secret lock icon - always visible, can hide/show cover letters */}
      <SecretLock
        onUnlock={() => setShowCoverLetters(true)}
        onLock={() => setShowCoverLetters(false)}
      />

      {/* Subtle Clemson Tiger logo - bottom left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="no-print fixed bottom-6 left-6 z-30 opacity-30 transition-opacity hover:opacity-50"
      >
        <Image
          src="/clemson-tigers-logo.svg"
          alt="Clemson Tigers"
          width={32}
          height={32}
          className="h-8 w-8"
        />
      </motion.div>
    </div>
  );
}
