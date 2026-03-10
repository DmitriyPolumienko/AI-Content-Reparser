"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SubtitleEditorProps {
  transcript: string;
  onChange: (text: string) => void;
}

export default function SubtitleEditor({ transcript, onChange }: SubtitleEditorProps) {
  const [text, setText] = useState(transcript);

  useEffect(() => {
    setText(transcript);
  }, [transcript]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleChange = (val: string) => {
    setText(val);
    onChange(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          Transcript
        </label>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 glass rounded-full text-xs text-slate-400">
            {wordCount.toLocaleString()} words
          </span>
          <span className="px-3 py-1 glass rounded-full text-xs text-slate-400">
            {charCount.toLocaleString()} chars
          </span>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        placeholder="Extracted transcript will appear here. You can edit it before generating content..."
        className="w-full bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 p-4 text-sm leading-relaxed resize-none"
      />

      <p className="text-slate-600 text-xs">
        Edit the transcript to correct any errors or add context before generating.
      </p>
    </motion.div>
  );
}
