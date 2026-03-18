"use client";

import { motion } from "framer-motion";

interface ErrorStateProps {
  statusCode: 502 | 504;
  onRetry?: () => void;
}

export default function ErrorState({ statusCode, onRetry }: ErrorStateProps) {
  const isTimeout = statusCode === 504;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Animated icon with pulsing rings */}
      <div className="relative mb-8 flex items-center justify-center">
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div
          className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,88,12,0.12))",
            borderColor: "rgba(245,158,11,0.3)",
            boxShadow: "0 0 30px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          initial={{ rotate: -6 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <motion.span
            className="text-4xl select-none"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            {isTimeout ? "⏱️" : "⚡"}
          </motion.span>
        </motion.div>
      </div>

      {/* Text content */}
      <motion.div
        className="max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <p className="text-xs font-mono text-amber-400/70 tracking-widest uppercase mb-3">
          HTTP {statusCode}
        </p>
        <h2 className="text-xl font-bold text-white mb-3">
          {isTimeout ? "Request Timed Out" : "Service Temporarily Unavailable"}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          {isTimeout
            ? "The AI took too long to respond. This sometimes happens with longer transcripts. Please try again."
            : "Our AI service is temporarily unreachable. This is usually brief\u00a0— please try again in a moment."}
        </p>
      </motion.div>

      {onRetry && (
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-8 px-6 py-3 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #10B981, #059669, #047857)",
            boxShadow: "0 0 20px rgba(16,185,129,0.35)",
          }}
        >
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
              animation: "shimmer 2.5s infinite",
            }}
          />
          <span className="relative z-10">↺ Try Again</span>
        </motion.button>
      )}
    </motion.div>
  );
}
