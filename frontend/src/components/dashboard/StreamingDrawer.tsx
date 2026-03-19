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

const SKELETON_WIDTHS = ["85%", "92%", "78%", "88%", "65%", "90%", "72%", "80%", "60%", "87%"];
/** Max characters used when composing a Twitter/X share intent URL */
const TWITTER_CHAR_LIMIT = 280;

export default function StreamingDrawer({
  isOpen,
  isStreaming,
  content,
  onClose,
}: StreamingDrawerProps) {
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  // Close share menu when clicking outside (deferred so the opening click doesn't immediately close it)
  useEffect(() => {
    if (!shareOpen) return;
    let timerId: ReturnType<typeof setTimeout>;
    const handler = () => setShareOpen(false);
    timerId = setTimeout(() => {
      document.addEventListener("click", handler);
    }, 0);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("click", handler);
    };
  }, [shareOpen]);

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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({ title: "Generated Content", text: content })
        .catch(() => {});
    } else {
      setShareOpen((prev) => !prev);
    }
  };

  const handleShareVia = (platform: "twitter" | "linkedin" | "copy") => {
    setShareOpen(false);
    if (platform === "copy") {
      handleCopy();
      return;
    }
    const encoded = encodeURIComponent(content.slice(0, TWITTER_CHAR_LIMIT));
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
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
          animate={{ width: 600, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 h-full overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <div className="w-[600px] h-full flex flex-col bg-[#0d1117] border-l-2 border-[#30363d] relative">
            {/* Workbench-style top bar */}
            <div className="flex items-center gap-0 border-b border-[#30363d] bg-[#161b22]">
              {/* Active tab */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-r border-[#30363d] border-b-2 border-b-[#f78166] bg-[#0d1117] -mb-px">
                <div className="relative flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-yellow-400" : "bg-emerald-400"}`} />
                  {isStreaming && (
                    <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-60" />
                  )}
                </div>
                <span className="text-sm font-medium text-white whitespace-nowrap">
                  {isStreaming ? "Generating…" : "Output"}
                </span>
                {!isStreaming && content && (
                  <span className="text-xs text-slate-500 font-mono">
                    {content.length.toLocaleString()} chars
                  </span>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Toolbar actions */}
              <div className="flex items-center gap-1 px-3">
                {!isStreaming && content && (
                  <>
                    {/* Copy */}
                    <button
                      onClick={handleCopy}
                      title="Copy to clipboard"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/8 border border-transparent hover:border-[#30363d] rounded-md transition-all"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>

                    {/* Share */}
                    <div className="relative">
                      <button
                        onClick={handleShare}
                        title="Share"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/8 border border-transparent hover:border-[#30363d] rounded-md transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>

                      {/* Share dropdown */}
                      <AnimatePresence>
                        {shareOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1.5 w-44 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl z-50 overflow-hidden"
                          >
                            <button
                              onClick={() => handleShareVia("twitter")}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.256 5.626zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                              Share on X
                            </button>
                            <button
                              onClick={() => handleShareVia("linkedin")}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                              Share on LinkedIn
                            </button>
                            <div className="border-t border-[#30363d]" />
                            <button
                              onClick={() => handleShareVia("copy")}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy content
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Download */}
                    <button
                      onClick={handleDownload}
                      title="Download as text file"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/8 border border-transparent hover:border-[#30363d] rounded-md transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>

                    <div className="w-px h-4 bg-[#30363d] mx-1" />
                  </>
                )}

                {/* Close */}
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-md hover:bg-white/8"
                  aria-label="Close panel"
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
              className="flex-1 overflow-y-auto scroll-smooth"
              style={{ background: "#0d1117" }}
            >
              {/* Skeleton while streaming and no content yet */}
              {isStreaming && !content && (
                <div className="space-y-4 p-6 pt-8">
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
                  className="p-6"
                >
                  <pre className="text-[#e6edf3] text-[13px] leading-[1.7] whitespace-pre-wrap font-mono">
                    {content}
                  </pre>
                  {/* Blinking cursor while still streaming */}
                  {isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer status bar */}
            <div className="px-5 py-2.5 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isStreaming && content ? (
                  <span className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Generation complete
                  </span>
                ) : isStreaming ? (
                  <span className="text-xs text-yellow-400 flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Streaming…
                  </span>
                ) : null}
              </div>
              {content && (
                <span className="text-xs text-slate-500 font-mono">
                  {content.length.toLocaleString()} chars
                </span>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
