'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center"
      >
        {/* Greeting */}
        <motion.p
          variants={itemVariants}
          className="text-accent mb-4 font-mono text-sm tracking-widest uppercase"
        >
          Hello, I&apos;m
        </motion.p>

        {/* Name with kinetic typography */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl">
          <AnimatedText text="Jamey McElveen" className="text-gradient" />
        </h1>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="text-foreground-muted mb-8 text-xl sm:text-2xl md:text-3xl"
        >
          Senior Software Architect & <span className="text-foreground">Engineering Leader</span>
        </motion.h2>

        {/* Summary */}
        <motion.p
          variants={itemVariants}
          className="text-foreground-muted mx-auto mb-12 max-w-2xl text-lg leading-relaxed"
        >
          25+ years crafting scalable solutions in{' '}
          <span className="text-foreground">Christian tech</span> and{' '}
          <span className="text-foreground">fintech</span>. Architecting platforms that serve
          50,000+ organizations. Pioneering{' '}
          <span className="text-accent">AI-augmented engineering</span> workflows.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
          <Link
            href="/resume"
            className="glow group bg-accent text-background relative overflow-hidden rounded-full px-8 py-3 font-medium transition-all hover:scale-105"
          >
            <span className="relative z-10">View Resume</span>
            <span className="bg-accent-secondary absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
          </Link>
          <Link
            href="/cover-letters"
            className="glass-card text-foreground hover:border-accent/50 rounded-full px-8 py-3 font-medium transition-all hover:scale-105"
          >
            Cover Letters
          </Link>
        </motion.div>

        {/* Tech stack badges */}
        <motion.div variants={itemVariants} className="mt-16 flex flex-wrap justify-center gap-3">
          {['C#', '.NET Core', 'React', 'TypeScript', 'Snowflake', 'Cursor AI'].map((tech) => (
            <span
              key={tech}
              className="glass-card text-foreground-muted hover:text-accent rounded-full px-4 py-1.5 font-mono text-xs transition-colors"
            >
              {tech}
            </span>
          ))}
        </motion.div>

        {/* Contact links */}
        <motion.div
          variants={itemVariants}
          className="text-foreground-muted mt-12 flex flex-wrap justify-center gap-6 text-sm"
        >
          <a
            href="mailto:jamey@mcelveen.us"
            className="hover:text-accent flex items-center gap-2 transition-colors"
          >
            <span className="text-lg">📧</span>
            jamey@mcelveen.us
          </a>
          <a
            href="tel:+18436188078"
            className="hover:text-accent flex items-center gap-2 transition-colors"
          >
            <span className="text-lg">📞</span>
            (843) 618-8078
          </a>
          <span className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            Timmonsville, SC
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
