"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "@/components/ui/Select";

interface GenerationSettingsProps {
  onSettingsChange: (settings: { contentType: string; keywords: string[] }) => void;
}

const contentTypeOptions = [
  { value: "seo_article", label: "📄 SEO Article" },
  { value: "linkedin", label: "💼 LinkedIn Post" },
  { value: "twitter_thread", label: "🐦 Twitter Thread" },
];

export default function GenerationSettings({ onSettingsChange }: GenerationSettingsProps) {
  const [contentType, setContentType] = useState("seo_article");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const addKeyword = (value: string) => {
    const trimmed = value.trim().replace(/,+\s*$/, "");
    if (trimmed && !keywords.includes(trimmed)) {
      const next = [...keywords, trimmed];
      setKeywords(next);
      onSettingsChange({ contentType, keywords: next });
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    const next = keywords.filter((k) => k !== kw);
    setKeywords(next);
    onSettingsChange({ contentType, keywords: next });
  };

  const handleContentTypeChange = (val: string) => {
    setContentType(val);
    onSettingsChange({ contentType: val, keywords });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <Select
        label="Content Type"
        options={contentTypeOptions}
        value={contentType}
        onChange={handleContentTypeChange}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Keywords <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addKeyword(keywordInput);
            }
          }}
          onBlur={() => keywordInput.trim() && addKeyword(keywordInput)}
          placeholder="Type keyword and press Enter..."
          className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 py-2.5 px-4 text-sm"
        />

        <AnimatePresence>
          {keywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {keywords.map((kw) => (
                <motion.span
                  key={kw}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-medium"
                >
                  {kw}
                  <button
                    onClick={() => removeKeyword(kw)}
                    className="text-emerald-400 hover:text-white transition-colors leading-none"
                    aria-label={`Remove ${kw}`}
                  >
                    ✕
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-slate-600 text-xs">
          Keywords will be naturally integrated into the generated content.
        </p>
      </div>
    </motion.div>
  );
}
