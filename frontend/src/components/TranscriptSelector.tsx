"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerButton from "@/components/effects/ShimmerButton";

export interface TranscriptOption {
  language_code: string;
  language_name: string;
  is_generated: boolean;
  is_translatable: boolean;
}

interface TranscriptSelectorProps {
  url: string;
  onSelect: (language: string, preferManual: boolean) => void;
}

export default function TranscriptSelector({ url, onSelect }: TranscriptSelectorProps) {
  const [options, setOptions] = useState<TranscriptOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    setError("");
    setOptions([]);
    setSelectedIndex(null);
    setAnalyzed(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transcripts/list?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) {
        let detail = "Failed to fetch transcript options.";
        try {
          const errData = await res.json();
          if (errData?.detail) detail = errData.detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }
      const data = await res.json();
      const transcripts: TranscriptOption[] = data.available_transcripts ?? [];
      setOptions(transcripts);
      setAnalyzed(true);

      // Auto-select the first option and notify parent immediately
      if (transcripts.length >= 1) {
        setSelectedIndex(0);
        onSelect(transcripts[0].language_code, !transcripts[0].is_generated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    const option = options[index];
    onSelect(option.language_code, !option.is_generated);
  };

  return (
    <div className="space-y-4">
      <ShimmerButton onClick={fetchOptions} disabled={loading || !url.trim()} size="md">
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </>
        ) : (
          "Analyze Video →"
        )}
      </ShimmerButton>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analyzed && options.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-slate-300">Select transcript:</p>
            <div className="flex flex-col gap-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                    selectedIndex === idx
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  <span className="font-medium">{option.language_name}</span>
                  {option.is_translatable && (
                    <span className="ml-2 text-xs text-slate-500">• translatable</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {analyzed && options.length === 1 && selectedIndex === 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-emerald-400 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Auto-selected: {options[0].language_name}
          </motion.p>
        )}

        {analyzed && options.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm"
          >
            No transcripts available for this video.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
