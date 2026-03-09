'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, RotateCcw, Download, Check, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/effects/Toast';

interface ResultOutputProps {
  content: string;
  wordsUsed: number;
  tokensLeft: number;
  onRegenerate: () => void;
  onReset: () => void;
}

export default function ResultOutput({
  content,
  wordsUsed,
  tokensLeft,
  onRegenerate,
  onReset,
}: ResultOutputProps) {
  const [copied, setCopied] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showToast('Content copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-content-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded successfully!', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {ToastComponent}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Your Content is Ready!</h2>
          <p className="text-white/60 text-sm">Copy, download, or regenerate below.</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-white/60">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {wordsUsed.toLocaleString()} words used
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-emerald-500/20 text-xs text-emerald-400">
            {tokensLeft.toLocaleString()} left
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/20 transition-all duration-200"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/20 transition-all duration-200"
          title="Download as Markdown"
        >
          <Download className="w-3.5 h-3.5" />
          Download .md
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/20 transition-all duration-200"
          title="Regenerate"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Regenerate
        </button>
      </div>

      {/* Content */}
      <div className="glass border border-white/10 rounded-xl p-5 min-h-64 max-h-[500px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-white/85 font-mono leading-relaxed">
          {content}
        </pre>
      </div>

      <Button variant="outline" onClick={onReset} fullWidth>
        Start Over with New Video
      </Button>
    </motion.div>
  );
}
