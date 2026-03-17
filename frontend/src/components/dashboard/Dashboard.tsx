"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import UrlInput from "./UrlInput";
import SubtitleEditor from "./SubtitleEditor";
import GenerationSettings from "./GenerationSettings";
import ResultOutput from "./ResultOutput";
import SkeletonLoader from "./SkeletonLoader";
import LoadingProgress from "./LoadingProgress";
import GradientOrbs from "@/components/effects/GradientOrbs";
import ShimmerButton from "@/components/effects/ShimmerButton";
import Navbar from "@/components/landing/Navbar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

type Step = 1 | 2 | 3 | 4;

interface Settings {
  contentType: string;
  keywords: string[];
}

const STEPS = [
  { num: 1, label: "Enter URL" },
  { num: 2, label: "Edit Transcript" },
  { num: 3, label: "Configure" },
  { num: 4, label: "Result" },
];

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function Dashboard() {
  const [step, setStep] = useState<Step>(1);
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [settings, setSettings] = useState<Settings>({ contentType: "seo_article", keywords: [] });
  const [generatedContent, setGeneratedContent] = useState("");
  const [wordsRemaining, setWordsRemaining] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExtract = (extractedUrl: string, extractedTranscript: string) => {
    setUrl(extractedUrl);
    setTranscript(extractedTranscript);
    setStep(2);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          content_type: settings.contentType,
          keywords: settings.keywords,
        }),
      });
      if (!res.ok) throw new Error("Generation failed. Please try again.");
      const data = await res.json();
      setGeneratedContent(data.content);
      setWordsRemaining(data.words_remaining ?? wordsRemaining);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setUrl("");
    setTranscript("");
    setSettings({ contentType: "seo_article", keywords: [] });
    setGeneratedContent("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <GradientOrbs />

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo-icon.png" alt="V2Post" width={28} height={28} />
            <span className="font-bold text-white text-sm font-display">
              V2<span className="gradient-text">Post</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 glass rounded-full text-xs text-slate-400">
              Words remaining:{" "}
              <span className="text-emerald-400 font-semibold">
                {wordsRemaining.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleStartOver}
              className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
            >
              ↺ Start Over
            </button>
          </div>
        </div>
      </header>

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-3"
      />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-10 pt-24">
        {/* Stats banner — placeholder metrics; replace with real API data when available */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">247</p>
                <p className="text-xs text-slate-500">Videos Processed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">~2m</p>
                <p className="text-xs text-slate-500">Avg Processing Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">98.5%</p>
                <p className="text-xs text-slate-500">Success Rate</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step indicators — gradient progress bar */}
        <div className="mb-10">
          {/* Progress bar */}
          <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ background: "linear-gradient(90deg, #10B981, #059669)" }}
            />
          </div>
          {/* Step labels */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    step === s.num
                      ? "border text-emerald-300"
                      : step > s.num
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-white/5 border border-white/10 text-slate-500"
                  }`}
                  style={
                    step === s.num
                      ? {
                          background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))",
                          borderColor: "rgba(16,185,129,0.4)",
                        }
                      : {}
                  }
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      step > s.num
                        ? "bg-emerald-500 text-white"
                        : step === s.num
                        ? "text-white"
                        : "bg-white/10 text-slate-500"
                    }`}
                    style={
                      step === s.num
                        ? { background: "linear-gradient(135deg, #10B981, #059669)" }
                        : {}
                    }
                  >
                    {step > s.num ? "✓" : s.num}
                  </span>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="h-px w-6 transition-all duration-500"
                    style={{
                      background:
                        step > s.num
                          ? "linear-gradient(90deg, #10B981, #059669)"
                          : "rgba(255,255,255,0.08)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="glass-card p-6 sm:p-8 min-h-[400px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {step === 1 && <UrlInput onExtract={handleExtract} />}

              {step === 2 && (
                <div className="space-y-5">
                  <SubtitleEditor
                    transcript={transcript}
                    onChange={setTranscript}
                  />
                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-slate-500 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <ShimmerButton
                      size="md"
                      onClick={() => setStep(3)}
                      disabled={!transcript.trim()}
                    >
                      Next: Configure →
                    </ShimmerButton>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <GenerationSettings onSettingsChange={setSettings} />

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                    >
                      ⚠️ {error}
                    </motion.p>
                  )}

                  {loading && (
                    <div className="mt-6">
                      <LoadingProgress
                        message="🪄 Generating your content with GPT-4.1..."
                        warningMessage="🪄 Generating your content... Please don't close this tab."
                      />
                      <div className="mt-4">
                        <SkeletonLoader />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="text-sm text-slate-500 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <ShimmerButton size="md" onClick={handleGenerate} disabled={loading}>
                      {loading ? "Generating..." : "Generate Content →"}
                    </ShimmerButton>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <ResultOutput
                    content={generatedContent}
                    onRegenerate={handleGenerate}
                    isRegenerating={loading}
                  />
                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(3)}
                      className="text-sm text-slate-500 hover:text-white transition-colors"
                    >
                      ← Back to Settings
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      + New Content
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick tips */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/5 rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span>💡</span> Pro Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <span className="text-emerald-400">→</span>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Choose the right language</p>
                  <p className="text-xs text-slate-500 mt-1">Manual transcripts are more accurate than auto-generated ones</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400">→</span>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Videos with good audio work best</p>
                  <p className="text-xs text-slate-500 mt-1">Clear speech = better auto-generated captions</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
