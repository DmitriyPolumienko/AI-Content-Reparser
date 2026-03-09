'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronLeft } from 'lucide-react';
import { generateContent } from '@/lib/api';
import GradientOrbs from '@/components/effects/GradientOrbs';
import GridPattern from '@/components/effects/GridPattern';
import UrlInput from '@/components/dashboard/UrlInput';
import SubtitleEditor from '@/components/dashboard/SubtitleEditor';
import GenerationSettings from '@/components/dashboard/GenerationSettings';
import ResultOutput from '@/components/dashboard/ResultOutput';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['URL Input', 'Edit Transcript', 'Settings', 'Result'];

export default function DashboardPage() {
  const [step, setStep] = useState<Step>(1);
  const [subtitles, setSubtitles] = useState('');
  const [editedSubtitles, setEditedSubtitles] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [wordsUsed, setWordsUsed] = useState(0);
  const [tokensLeft, setTokensLeft] = useState(10000);
  const [generating, setGenerating] = useState(false);
  const [contentType, setContentType] = useState('seo_article');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleExtracted = (subs: string) => {
    setSubtitles(subs);
    setStep(2);
  };

  const handleEditorNext = (edited: string) => {
    setEditedSubtitles(edited);
    setStep(3);
  };

  const handleGenerate = async (ct: string, kws: string[]) => {
    setContentType(ct);
    setKeywords(kws);
    setGenerating(true);
    setError(null);
    try {
      const result = await generateContent({
        subtitles: editedSubtitles,
        content_type: ct,
        keywords: kws,
      });
      setGeneratedContent(result.content);
      setWordsUsed(result.words_used);
      setTokensLeft(result.tokens_left);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate(contentType, keywords);
  };

  const handleReset = () => {
    setStep(1);
    setSubtitles('');
    setEditedSubtitles('');
    setGeneratedContent('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <GradientOrbs />
      <GridPattern />

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">
              AI<span className="text-gradient">Reparser</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as Step;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      background: isActive
                        ? 'linear-gradient(135deg, #7C3AED, #06B6D4)'
                        : isCompleted
                        ? '#10B981'
                        : 'rgba(255,255,255,0.05)',
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive || isCompleted ? 'text-white' : 'text-white/30'
                    } ${isActive ? 'shadow-glow' : ''}`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </motion.div>
                  <span
                    className={`hidden sm:block text-xs font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-white/30'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`w-8 h-px mx-2 transition-colors duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content card */}
        <div className="glass border border-white/10 rounded-2xl p-6 sm:p-8 shadow-card">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <UrlInput onExtracted={handleExtracted} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <SubtitleEditor
                  subtitles={subtitles}
                  onNext={handleEditorNext}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <GenerationSettings
                  onGenerate={handleGenerate}
                  onBack={() => setStep(2)}
                  loading={generating}
                />
                {generating && (
                  <div className="mt-6">
                    <p className="text-sm text-white/60 mb-4 text-center">
                      AI is crafting your content...
                    </p>
                    <SkeletonLoader lines={10} />
                  </div>
                )}
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="step4" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <ResultOutput
                  content={generatedContent}
                  wordsUsed={wordsUsed}
                  tokensLeft={tokensLeft}
                  onRegenerate={handleRegenerate}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
