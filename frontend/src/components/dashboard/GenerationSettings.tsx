'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

const contentTypes = [
  {
    value: 'seo_article',
    label: 'SEO Article',
    description: 'Long-form article with headings and keyword optimization',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn Post',
    description: 'Professional post with hook, bullet points, and CTA',
  },
  {
    value: 'twitter',
    label: 'Twitter Thread',
    description: 'Engaging thread of numbered tweets (max 280 chars each)',
  },
];

interface GenerationSettingsProps {
  onGenerate: (contentType: string, keywords: string[]) => void;
  onBack: () => void;
  loading: boolean;
}

export default function GenerationSettings({
  onGenerate,
  onBack,
  loading,
}: GenerationSettingsProps) {
  const [contentType, setContentType] = useState('seo_article');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords((prev) => [...prev, kw]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Generation Settings</h2>
        <p className="text-white/60 text-sm">
          Choose your content format and add target keywords.
        </p>
      </div>

      {/* Content type */}
      <Select
        label="Content Type"
        options={contentTypes}
        value={contentType}
        onChange={setContentType}
      />

      {/* Keywords */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          Target Keywords
          <span className="ml-2 text-white/30 text-xs font-normal">
            (optional · press Enter or comma to add)
          </span>
        </label>

        <div className="flex gap-2">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. content marketing"
            leftIcon={<Tag className="w-4 h-4" />}
          />
          <Button variant="outline" onClick={addKeyword} className="shrink-0 px-4">
            Add
          </Button>
        </div>

        {/* Tag chips */}
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 pt-1"
          >
            {keywords.map((kw) => (
              <motion.span
                key={kw}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-600/15 border border-violet-500/30 text-violet-300"
              >
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="hover:text-white transition-colors"
                  aria-label={`Remove keyword ${kw}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          onClick={() => onGenerate(contentType, keywords)}
          fullWidth
          loading={loading}
          size="lg"
        >
          {loading ? 'Generating...' : 'Generate Content'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
}
