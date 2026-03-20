"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOG_MESSAGES = [
  "Initializing content synthesis pipeline...",
  "Loading language model weights...",
  "Parsing transcript tokens...",
  "Analyzing content structure...",
  "Identifying key topics and entities...",
  "Applying tone of voice parameters...",
  "Adjusting style and language register...",
  "Generating semantic outline...",
  "Writing introduction section...",
  "Expanding body content...",
  "Optimizing keyword placement...",
  "Finalizing formatting...",
  "Running quality checks...",
  "Streaming output to client...",
];

interface FloatingTerminalProps {
  isStreaming: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FloatingTerminal({ isStreaming, isOpen, onToggle }: FloatingTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add timestamped log lines while streaming
  useEffect(() => {
    if (isStreaming) {
      setLogs([]);
      setLogIndex(0);
      intervalRef.current = setInterval(() => {
        setLogIndex((i) => {
          const next = i + 1;
          const msg = LOG_MESSAGES[i % LOG_MESSAGES.length];
          const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
          setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
          return next;
        });
      }, 900);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
      setLogs((prev) => [...prev, `[${ts}] ✓ Content generation complete.`]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming]);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div
      className="oracle-terminal fixed bottom-0 z-50 flex flex-col"
      style={{
        left: 260,
        right: 0,
        maxHeight: isOpen ? 200 : 36,
        transition: "max-height 0.3s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 flex-shrink-0 w-full text-left"
        style={{ height: 36 }}
      >
        {/* Traffic lights */}
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />

        <span
          className="ml-2 text-[11px] font-mono flex items-center gap-1.5"
          style={{ color: "rgba(157,80,255,0.9)" }}
        >
          {isStreaming && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#9D50FF]"
              style={{ animation: "violet-ping 1.5s ease-in-out infinite" }}
            />
          )}
          oracle-system — synthesis console
        </span>
        <span
          className="ml-auto text-[10px]"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {isOpen ? "▼" : "▲"}
        </span>
      </button>

      {/* Log lines */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5"
            style={{ maxHeight: 164 }}
          >
            {logs.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] leading-5 whitespace-nowrap font-mono"
                style={{
                  color: line.includes("✓")
                    ? "#B78AFF"
                    : "rgba(157,80,255,0.8)",
                }}
              >
                {line}
              </motion.p>
            ))}
            <div ref={logsEndRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
