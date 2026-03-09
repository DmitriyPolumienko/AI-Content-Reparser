'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, ClipboardPaste } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SubtitleEditorProps {
  subtitles: string;
  onNext: (edited: string) => void;
  onBack: () => void;
}

export default function SubtitleEditor({ subtitles, onNext, onBack }: SubtitleEditorProps) {
  const [text, setText] = useState(subtitles);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
    } catch {
      // Clipboard access denied
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Review Transcript</h2>
          <p className="text-white/60 text-sm">Edit the raw transcript before generating content.</p>
        </div>

        {/* Stats pill */}
        <div className="hidden sm:flex items-center gap-3 glass border border-white/10 rounded-full px-4 py-2 text-xs text-white/50">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="w-px h-3 bg-white/20" />
          <span>{charCount.toLocaleString()} chars</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setText('')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
          title="Clear"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
        <button
          onClick={handlePaste}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
          title="Paste from clipboard"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          Paste
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-64 bg-white/3 border border-white/10 rounded-xl p-4 text-sm text-white/80 placeholder-white/20 font-mono leading-relaxed resize-y focus:outline-none focus:border-violet-500/50 focus-glow transition-all duration-200"
        placeholder="Transcript will appear here..."
        spellCheck={false}
      />

      {/* Mobile stats */}
      <div className="sm:hidden flex gap-4 text-xs text-white/40">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{charCount.toLocaleString()} chars</span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => onNext(text)} fullWidth disabled={!text.trim()}>
          Continue to Settings
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
