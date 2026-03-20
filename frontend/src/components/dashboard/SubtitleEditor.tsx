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
        <label className="text-sm font-medium text-white">
          Transcript
        </label>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 text-xs rounded-[4px]"
            style={{
              background: "rgba(157,80,255,0.06)",
              border: "1px solid rgba(157,80,255,0.15)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {wordCount.toLocaleString()} words
          </span>
          <span
            title="This amount will be deducted from your balance."
            className="px-3 py-1 text-xs font-medium cursor-help rounded-[4px]"
            style={{
              background: "rgba(157,80,255,0.1)",
              border: "1px solid rgba(157,80,255,0.25)",
              color: "#9D50FF",
            }}
          >
            {charCount.toLocaleString()} chars
          </span>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        placeholder="Extracted transcript will appear here. You can edit it before generating content..."
        className="w-full text-sm leading-relaxed resize-none focus:outline-none transition-all duration-300"
        style={{
          background: "rgba(18,20,28,0.5)",
          border: "1px solid rgba(157,80,255,0.15)",
          borderRadius: 8,
          color: "rgba(255,255,255,0.9)",
          padding: "14px 16px",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(157,80,255,0.5)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(157,80,255,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(157,80,255,0.15)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
        Edit the transcript to correct any errors or add context before generating.
      </p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
        Line breaks are AI‑inferred and may not match original timing; the overall meaning is preserved.
      </p>
    </motion.div>
  );
}
