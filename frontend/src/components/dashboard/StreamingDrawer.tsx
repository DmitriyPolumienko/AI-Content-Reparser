"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/effects/Toast";

interface StreamingDrawerProps {
  isOpen: boolean;
  isStreaming: boolean;
  content: string;
  onClose: () => void;
}

/** A single skeleton line shown while generation is starting */
function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      className="h-3 rounded-full bg-white/10 animate-pulse"
      style={{ width }}
    />
  );
}

const SKELETON_WIDTHS = ["85%", "92%", "78%", "88%", "65%", "90%", "72%", "80%"];

export default function StreamingDrawer({
  isOpen,
  isStreaming,
  content,
  onClose,
}: StreamingDrawerProps) {
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-content.txt";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded!", "success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="streaming-drawer"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 h-full overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <div className="w-[420px] h-full flex flex-col bg-[#0a0a1a] border-l border-white/8 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  {isStreaming && (
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  )}
                </div>
                <span className="text-sm font-semibold text-white">
                  {isStreaming ? "Generating…" : "Generated Content"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isStreaming && content && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                    >
                      {copied ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  aria-label="Close drawer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content area */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto p-5 scroll-smooth"
            >
              {/* Skeleton while streaming and no content yet */}
              {isStreaming && !content && (
                <div className="space-y-3 pt-2">
                  {SKELETON_WIDTHS.map((w, i) => (
                    <SkeletonLine key={i} width={w} />
                  ))}
                </div>
              )}

              {/* Progressive content */}
              {content && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {content}
                  </pre>
                  {/* Blinking cursor while still streaming */}
                  {isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer status */}
            {!isStreaming && content && (
              <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  {content.length.toLocaleString()} characters
                </span>
                <span className="text-xs text-emerald-500 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Generation complete
                </span>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
