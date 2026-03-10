"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerButton from "@/components/effects/ShimmerButton";

interface UrlInputProps {
  onExtract: (url: string, transcript: string) => void;
}

function isValidYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const isYouTubeDomain =
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "youtu.be" ||
      u.hostname === "m.youtube.com";
    if (!isYouTubeDomain) return false;
    if (u.hostname === "youtu.be") return u.pathname.length > 1;
    if (u.pathname.startsWith("/shorts/")) return true;
    return u.searchParams.has("v");
  } catch {
    return false;
  }
}

export default function UrlInput({ onExtract }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const handleExtract = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }
    if (!isValidYouTubeUrl(url.trim())) {
      setError("Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) throw new Error("Failed to extract transcript. Make sure the video has captions enabled.");
      const data = await res.json();
      onExtract(url.trim(), data.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">
            YouTube Video URL
          </label>
          {/* Tooltip trigger */}
          <div className="relative">
            <button
              className="text-slate-500 hover:text-slate-300 transition-colors text-xs flex items-center gap-1"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              type="button"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help
            </button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 bottom-6 z-50 w-64 bg-black/90 border border-white/10 rounded-xl p-3 text-xs text-slate-300 shadow-xl"
                >
                  <p className="font-semibold text-white mb-1">Supported formats:</p>
                  <ul className="space-y-1 text-slate-400 font-mono text-xs">
                    <li>youtube.com/watch?v=...</li>
                    <li>youtu.be/...</li>
                    <li>youtube.com/shorts/...</li>
                  </ul>
                  <p className="mt-2 text-slate-500">Video must have captions (auto or manual).</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative flex items-center">
            {/* YouTube icon */}
            <div className="absolute left-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleExtract()}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 py-3 pl-10 pr-4 text-sm"
            />
          </div>
          <ShimmerButton
            onClick={handleExtract}
            disabled={loading}
            size="md"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Extracting...
              </>
            ) : (
              "Extract →"
            )}
          </ShimmerButton>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm mt-2 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Helper text */}
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-emerald-400 font-medium">How it works:</span> Paste a YouTube URL above and we&apos;ll
          extract the video transcript automatically. Supports videos with auto-generated or manually
          added captions. After extraction, you can edit the transcript before generating content.
        </p>
      </div>

      <p className="text-slate-600 text-xs">
        Supports YouTube videos with auto-generated or manually added captions.
      </p>
    </motion.div>
  );
}
