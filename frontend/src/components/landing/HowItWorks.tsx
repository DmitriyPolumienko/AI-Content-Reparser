"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Paste a YouTube URL",
    description:
      "Drop any YouTube video link into our smart input field. We support all public videos with auto-generated or manual captions.",
    icon: "🔗",
    detail: "Supports youtube.com/watch?v=, youtu.be/, and YouTube Shorts",
  },
  {
    number: "02",
    title: "AI Extracts & Processes Subtitles",
    description:
      "Our AI instantly pulls the full video transcript, cleans up filler words, and structures the content. Review and edit before the next step.",
    icon: "🤖",
    detail: "Takes under 10 seconds for most videos",
  },
  {
    number: "03",
    title: "Choose Format & Add Keywords",
    description:
      "Select your output format: SEO Article, LinkedIn Post, or Twitter Thread. Optionally add target keywords for natural integration.",
    icon: "⚙️",
    detail: "SEO Article · LinkedIn Post · Twitter Thread",
  },
  {
    number: "04",
    title: "Get Publication-Ready Content",
    description:
      "Hit Generate and receive fully formatted, publish-ready content in seconds. Copy, export as markdown, or paste directly into your CMS.",
    icon: "🚀",
    detail: "Under 30 seconds from URL to finished article",
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const lineProgress = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  return (
    <section id="how-it-works" className="section-padding relative overflow-hidden" ref={containerRef}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display">
            Four steps to <span className="gradient-text">ready content</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg mt-4">
            The process is dead simple. Paste a URL, let AI work, and publish.
          </p>
        </motion.div>

        {/* Steps — vertical on mobile, 2-column zigzag on desktop */}
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card p-6 md:p-8 flex gap-5 items-start group hover:border-emerald-500/20 transition-colors duration-300"
            >
              {/* Step number — large, clearly visible */}
              <div className="shrink-0 text-center w-16">
                <div
                  className="text-5xl font-bold font-display leading-none"
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    opacity: 0.7,
                  }}
                >
                  {step.number}
                </div>
                <div className="mt-2 w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white font-display mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{step.description}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-xs">{step.detail}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated connecting line (desktop only, between columns) */}
        <div className="hidden md:flex justify-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 0 30px rgba(16,185,129,0.3)",
              }}
            >
              Start Your First Conversion →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
