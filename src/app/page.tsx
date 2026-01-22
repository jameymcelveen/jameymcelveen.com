'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ObfuscatedEmail, ObfuscatedPhone } from '@/components/ObfuscatedContact';
import { SecretLock } from '@/components/PinGate';
import { MapPin } from 'lucide-react';

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
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link
            href="/resume"
            className="glow group bg-accent relative overflow-hidden rounded-full px-6 py-2.5 font-medium text-white transition-all hover:scale-105 sm:px-8 sm:py-3"
          >
            <span className="relative z-10">View Resume</span>
            <span className="bg-accent-secondary absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
          </Link>

          {/* Only show cover letters button if unlocked */}
          {showCoverLetters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href="/cover-letters"
                className="glass-card text-foreground hover:border-accent/30 rounded-full px-6 py-2.5 font-medium transition-all hover:scale-105 sm:px-8 sm:py-3"
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
      </motion.div>

      {/* Secret lock icon - only show if not already unlocked */}
      {!showCoverLetters && <SecretLock onUnlock={() => setShowCoverLetters(true)} />}
    </div>
  );
}
