"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface SubtitleEditorProps {
  transcript: string;
  wordCount: number;
  onNext: (editedTranscript: string) => void;
  onBack: () => void;
}

export default function SubtitleEditor({
  transcript,
  wordCount,
  onNext,
  onBack,
}: SubtitleEditorProps) {
  const [text, setText] = useState(transcript);

  const currentWordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Step 2: Review & Edit Transcript</h2>
        <p className="text-slate-400 text-sm">
          The transcript has been extracted. You can edit it before generating content.
        </p>
      </div>

      <div className="glass-card p-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="w-full bg-transparent text-slate-200 text-sm leading-relaxed p-4 resize-none focus:outline-none placeholder-slate-600"
          placeholder="Transcript will appear here…"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {currentWordCount.toLocaleString()} words
          {wordCount !== currentWordCount && (
            <span className="ml-1 text-slate-600">(original: {wordCount.toLocaleString()})</span>
          )}
        </span>

        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <Button
            size="sm"
            onClick={() => onNext(text)}
            disabled={!text.trim()}
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
