"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export default function Card({
  children,
  hover = false,
  glow = false,
  className = "",
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-card p-6 ${
        glow ? "hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30" : ""
      } transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
