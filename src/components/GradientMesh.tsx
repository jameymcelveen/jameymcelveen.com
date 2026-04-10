'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function GradientMesh() {
  const pathname = usePathname();
  if (pathname === '/ai') {
    return null;
  }

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
