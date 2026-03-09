"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface ResultOutputProps {
  content: string;
  wordsUsed: number;
  wordsRemaining: number;
  onRegenerate: () => void;
  onStartOver: () => void;
}

export default function ResultOutput({
  content,
  wordsUsed,
  wordsRemaining,
  onRegenerate,
  onStartOver,
}: ResultOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Step 4: Your Content</h2>
          <p className="text-slate-400 text-sm">
            Review your AI-generated content below. Copy or regenerate as needed.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            Regenerate
          </Button>
          <Button size="sm" onClick={handleCopy}>
            {copied ? "✓ Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 p-4 glass-card text-sm">
        <div>
          <span className="text-slate-500">Words used: </span>
          <span className="text-white font-semibold">{wordsUsed.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-500">Words remaining: </span>
          <span className="text-green-400 font-semibold">{wordsRemaining.toLocaleString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="glass-card p-6">
        <pre className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-sans">
          {content}
        </pre>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onStartOver}>
          ← Start Over
        </Button>
        <Button size="sm" onClick={handleCopy}>
          {copied ? "✓ Copied!" : "Copy to Clipboard"}
        </Button>
      </div>
    </div>
  );
}
