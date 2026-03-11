"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GradientOrbs from "@/components/effects/GradientOrbs";
import NeuralNetwork from "@/components/effects/NeuralNetwork";
import ShimmerButton from "@/components/effects/ShimmerButton";
import TypewriterText from "@/components/effects/TypewriterText";

// Dynamic live counter
function LiveCounter() {
  const [count, setCount] = useState(127849); // fixed initial value — no hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Randomize only on the client after hydration is complete
    setCount(127849 + Math.floor(Math.random() * 1000));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const tick = () => {
      const delay = 1000 + Math.random() * 4000;
      const timer = setTimeout(() => {
        setAnimating(true);
        setCount((c) => c + Math.floor(Math.random() * 7) + 1);
        setTimeout(() => setAnimating(false), 300);
        tick();
      }, delay);
      return timer;
    };
    const timer = tick();
    return () => clearTimeout(timer);
  }, [mounted]);

  return (
    <span
      className="text-2xl md:text-3xl font-bold font-display gradient-text inline-block transition-transform duration-300"
      style={{ transform: animating ? "scale(1.08)" : "scale(1)" }}
    >
      {count.toLocaleString()}+
    </span>
  );
}

// Interactive How It Works guide steps
const guideSteps = [
  {
    id: 1,
    icon: "🔗",
    title: "Paste YouTube URL",
    content: (
      <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-white/10">
        <div className="w-4 h-4 rounded bg-red-500/70 shrink-0 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
        <span className="text-xs text-slate-400 font-mono truncate">youtube.com/watch?v=dQw4w9WgXcQ</span>
        <div className="ml-auto shrink-0 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs">
          Extract →
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: "🤖",
    title: "AI extracts subtitles",
    content: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Processing transcript...
        </div>
        <div className="space-y-1">
          {[100, 80, 60].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-emerald-500/20"
              style={{ width: `${w}%`, animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: "📄",
    title: "Choose your format",
    content: (
      <div className="flex gap-2">
        {["SEO Article", "LinkedIn", "Twitter"].map((f, i) => (
          <div
            key={f}
            className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
              i === 0
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            {f}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    icon: "✨",
    title: "Get ready content",
    content: (
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-emerald-500/30" />
        <div className="h-2 w-4/5 rounded-full bg-emerald-500/20" />
        <div className="h-2 w-3/5 rounded-full bg-emerald-500/15" />
        <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
          <span>✓</span> Publication-ready in 30 seconds
        </div>
      </div>
    ),
  },
];

function HowItWorksGuide() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % guideSteps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl border border-white/10 p-5 shadow-[0_0_60px_rgba(16,185,129,0.12)] max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-xs text-slate-500">V2Post</span>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {guideSteps.map((step, i) => (
          <motion.div
            key={step.id}
            onClick={() => setActiveStep(i)}
            className={`rounded-xl p-3 cursor-pointer transition-all duration-300 border ${
              activeStep === i
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-white/3 border-transparent hover:border-white/10"
            }`}
            animate={{ opacity: activeStep === i ? 1 : 0.6 }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{step.icon}</span>
              <span
                className={`text-xs font-semibold ${
                  activeStep === i ? "text-emerald-300" : "text-slate-400"
                }`}
              >
                {step.id}. {step.title}
              </span>
              {activeStep === i && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                />
              )}
            </div>
            <AnimatePresence>
              {activeStep === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {step.content}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 pt-3 border-t border-white/5 text-center">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Try It Now →
        </a>
      </div>
    </div>
  );
}

const badges = [
  { label: "⚡ Powered by GPT-4.1", delay: 0.5 },
  { label: "🚀 10x Faster", delay: 0.7 },
  { label: "🎯 SEO Optimized", delay: 0.9 },
];

export default function Hero() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background layers */}
      <GradientOrbs />
      <NeuralNetwork />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - text content */}
          <div className="text-center lg:text-left">
            {/* Floating badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              {badges.map((badge) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: badge.delay, duration: 0.5 }}
                  className="glass px-4 py-2 rounded-full text-sm text-slate-300 font-medium"
                >
                  {badge.label}
                </motion.div>
              ))}
            </div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold font-display leading-tight mb-6"
            >
              Turn Videos Into{" "}
              <span className="gradient-text block min-h-[1.2em]">
                <TypewriterText
                  strings={["SEO Articles", "LinkedIn Posts", "Twitter Threads", "Blog Content"]}
                  typeSpeed={80}
                  deleteSpeed={40}
                  pauseTime={2200}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed"
            >
              Paste a YouTube link. AI extracts the transcript and rephrases it into
              publish-ready content. From recording to published article in under{" "}
              <span className="text-white font-semibold">30 seconds</span>.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <ShimmerButton size="lg" onClick={() => router.push("/dashboard")}>
                Start Creating for Free →
              </ShimmerButton>
              <button className="px-8 py-4 text-slate-400 hover:text-white border border-white/10 rounded-xl transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5">
                Watch Demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="text-center lg:text-left">
                <LiveCounter />
                <div className="text-xs text-slate-500 mt-1">Articles Generated</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold font-display gradient-text">10x</div>
                <div className="text-xs text-slate-500 mt-1">Faster Creation</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold font-display gradient-text">99.9%</div>
                <div className="text-xs text-slate-500 mt-1">Uptime</div>
              </div>
            </motion.div>
          </div>

          {/* Right column - interactive guide */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          >
            <HowItWorksGuide />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
