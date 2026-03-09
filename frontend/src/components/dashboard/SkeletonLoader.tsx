'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  lines?: number;
}

export default function SkeletonLoader({ lines = 6 }: SkeletonLoaderProps) {
  const widths = [100, 90, 95, 75, 88, 60, 80, 70];

  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading content...">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="h-3 rounded-full bg-white/5 animate-pulse"
          style={{ width: `${widths[i % widths.length]}%` }}
        />
      ))}
    </div>
  );
}
