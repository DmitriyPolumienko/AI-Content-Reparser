'use client';

import { useState } from 'react';
import { Youtube, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { extractSubtitles } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SkeletonLoader from './SkeletonLoader';

interface UrlInputProps {
  onExtracted: (subtitles: string) => void;
}

export default function UrlInput({ onExtracted }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    setError(null);
    setLoading(true);
    setSuccess(false);
    try {
      const result = await extractSubtitles(url.trim());
      setSuccess(true);
      setTimeout(() => onExtracted(result.subtitles), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract subtitles');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleExtract();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <p className="text-sm text-white/60 text-center mb-6">
          Extracting transcript from YouTube...
        </p>
        <SkeletonLoader lines={8} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Paste your YouTube URL
        </h2>
        <p className="text-white/60 text-sm">
          We'll automatically extract the transcript and prepare it for AI generation.
        </p>
      </div>

      <div
        className={`relative transition-all duration-300 ${
          success
            ? 'ring-2 ring-emerald-500/50 shadow-glow-cyan rounded-xl'
            : ''
        }`}
      >
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://youtube.com/watch?v=..."
          leftIcon={<Youtube className="w-5 h-5 text-red-500" />}
          error={error ?? undefined}
          aria-label="YouTube URL"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      <Button onClick={handleExtract} fullWidth size="lg">
        Extract Transcript
        <ArrowRight className="w-5 h-5" />
      </Button>

      <p className="text-center text-xs text-white/30">
        Supports standard YouTube URLs · Shorts · Playlists
      </p>
    </motion.div>
  );
}
