"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import GradientOrbs from "@/components/effects/GradientOrbs";
import StarField from "@/components/effects/StarField";
import GridPattern from "@/components/effects/GridPattern";
import ShimmerButton from "@/components/effects/ShimmerButton";
import TypewriterText from "@/components/effects/TypewriterText";
import AnimatedCounter from "@/components/effects/AnimatedCounter";

const stats = [
  { value: 50000, suffix: "+", label: "Articles Generated" },
  { value: 10, suffix: "x", label: "Faster Creation" },
  { value: 99.9, suffix: "%", label: "Uptime" },
];

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
      <StarField />
      <GridPattern />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Floating badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {badges.map((badge) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: badge.delay, duration: 0.5 }}
              className="glass px-4 py-2 rounded-full text-sm text-slate-300 font-medium"
              style={{ animation: `float ${12 + Math.random() * 8}s ease-in-out infinite` }}
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
          className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6"
        >
          Turn Videos Into{" "}
          <span className="gradient-text block">
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
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Paste a YouTube link. AI extracts the transcript, rephrases it into
          publish-ready content. From recording to published article in under{" "}
          <span className="text-white font-semibold">30 seconds</span>.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <ShimmerButton size="lg" onClick={() => router.push("/dashboard")}>
            Start Creating for Free →
          </ShimmerButton>
          <button className="px-8 py-4 text-slate-400 hover:text-white border border-white/10 rounded-xl transition-all hover:border-white/20 hover:bg-white/5">
            Watch Demo
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-display gradient-text">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={2000}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Mock dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="mt-20 glass rounded-2xl border border-white/10 p-1 shadow-[0_0_60px_rgba(124,58,237,0.2)] max-w-3xl mx-auto"
        >
          {/* Fake browser bar */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="flex-1 mx-4 h-5 bg-white/5 rounded-full" />
          </div>
          {/* Fake dashboard content */}
          <div className="p-6 grid gap-4">
            <div className="flex gap-3 items-center">
              <div className="flex-1 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center px-3 gap-2">
                <div className="w-4 h-4 rounded bg-red-500/50 shrink-0" />
                <div className="h-3 w-48 bg-white/10 rounded-full" />
              </div>
              <div className="px-4 h-10 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-xs text-white font-medium flex items-center shrink-0">
                Extract
              </div>
            </div>
            <div className="h-24 bg-white/5 rounded-lg border border-white/10 p-3">
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                <div className="h-2 w-3/5 bg-white/10 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-8 bg-white/5 rounded-lg border border-violet-500/20" />
              <div className="h-8 bg-gradient-to-r from-violet-600/30 to-cyan-500/30 rounded-lg" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
