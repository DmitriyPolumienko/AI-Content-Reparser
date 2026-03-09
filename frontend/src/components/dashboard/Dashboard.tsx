"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UrlInput from "./UrlInput";
import SubtitleEditor from "./SubtitleEditor";
import GenerationSettings from "./GenerationSettings";
import ResultOutput from "./ResultOutput";

type Step = 1 | 2 | 3 | 4;

interface DashboardState {
  step: Step;
  transcript: string;
  wordCount: number;
  generatedContent: string;
  wordsUsed: number;
  wordsRemaining: number;
}

const STEPS = [
  { num: 1, label: "Enter URL" },
  { num: 2, label: "Edit Transcript" },
  { num: 3, label: "Configure" },
  { num: 4, label: "Result" },
];

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    step: 1,
    transcript: "",
    wordCount: 0,
    generatedContent: "",
    wordsUsed: 0,
    wordsRemaining: 0,
  });

  const setStep = (step: Step) => setState((s) => ({ ...s, step }));

  const handleTranscriptReady = (transcript: string, wordCount: number) => {
    setState((s) => ({ ...s, transcript, wordCount, step: 2 }));
  };

  const handleTranscriptEdited = (editedTranscript: string) => {
    setState((s) => ({ ...s, transcript: editedTranscript, step: 3 }));
  };

  const handleResult = (content: string, wordsUsed: number, wordsRemaining: number) => {
    setState((s) => ({
      ...s,
      generatedContent: content,
      wordsUsed,
      wordsRemaining,
      step: 4,
    }));
  };

  const handleRegenerate = () => setStep(3);
  const handleStartOver = () =>
    setState({
      step: 1,
      transcript: "",
      wordCount: 0,
      generatedContent: "",
      wordsUsed: 0,
      wordsRemaining: 0,
    });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
              Content Reparser
            </span>
          </Link>
          <div className="text-xs text-slate-500">
            Words remaining:{" "}
            <span className="text-green-400 font-semibold">
              {state.wordsRemaining > 0
                ? state.wordsRemaining.toLocaleString()
                : "10,000"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  state.step === s.num
                    ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                    : state.step > s.num
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-white/5 border border-white/10 text-slate-500"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    state.step > s.num
                      ? "bg-green-500 text-white"
                      : state.step === s.num
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {state.step > s.num ? "✓" : s.num}
                </span>
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-6 ${
                    state.step > s.num ? "bg-green-500/40" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="glass-card p-6 sm:p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {state.step === 1 && (
                <UrlInput onTranscriptReady={handleTranscriptReady} />
              )}
              {state.step === 2 && (
                <SubtitleEditor
                  transcript={state.transcript}
                  wordCount={state.wordCount}
                  onNext={handleTranscriptEdited}
                  onBack={() => setStep(1)}
                />
              )}
              {state.step === 3 && (
                <GenerationSettings
                  transcript={state.transcript}
                  onResult={handleResult}
                  onBack={() => setStep(2)}
                />
              )}
              {state.step === 4 && (
                <ResultOutput
                  content={state.generatedContent}
                  wordsUsed={state.wordsUsed}
                  wordsRemaining={state.wordsRemaining}
                  onRegenerate={handleRegenerate}
                  onStartOver={handleStartOver}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
