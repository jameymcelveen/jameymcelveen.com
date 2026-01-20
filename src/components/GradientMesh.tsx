'use client';

import { motion } from 'framer-motion';

export function GradientMesh() {
  return (
    <motion.div
      className="gradient-mesh"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      aria-hidden="true"
    />
  );
}
