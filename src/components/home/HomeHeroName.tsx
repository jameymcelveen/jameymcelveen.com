'use client';

import { motion } from 'framer-motion';

/** Home hero — Geist Sans, Jamey bold, raised “c” in McElveen. */
export function HomeHeroName() {
  return (
    <motion.span
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hero-name-display hero-name-h1 inline-block"
    >
      <span className="font-bold tracking-[-0.04em]">Jamey</span>{' '}
      <span className="font-normal tracking-[-0.03em]">
        M<span className="hero-name-raised-c">c</span>Elveen
      </span>
    </motion.span>
  );
}
