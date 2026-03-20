"use client";

import { motion } from "framer-motion";

interface AiAccuracyIndicatorProps {
  /** Current step (1–4). Progress = (step - 1) / (total - 1). */
  step: number;
  total?: number;
  size?: number;
}

/**
 * Radial progress indicator showing current step completion percentage.
 * Step 1 = 0%, Step 2 = 33%, Step 3 = 66%, Step 4 = 100%
 */
export default function AiAccuracyIndicator({ step, total = 4, size = 56 }: AiAccuracyIndicatorProps) {
  const pct = Math.round(((step - 1) / (total - 1)) * 100);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center oracle-glow"
      style={{ width: size, height: size }}
      title={`Step ${step} of ${total} — ${pct}% complete`}
    >
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
        {/* Track */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="rgba(157,80,255,0.15)"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress arc */}
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#9D50FF"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "28px 28px", transform: "rotate(-90deg)" }}
        />
      </svg>
      {/* Percentage label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold font-mono" style={{ color: "#9D50FF" }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}
