"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Paste Your Video Link",
    description:
      "Drop a YouTube URL into our smart input. We support YouTube now, with Twitch, TikTok, and Kick coming soon.",
    icon: "🔗",
  },
  {
    number: "02",
    title: "Review & Edit Transcript",
    description:
      "AI extracts the full transcript. Review, clean up, or add context before generation. Your control, our speed.",
    icon: "✏️",
  },
  {
    number: "03",
    title: "Generate & Publish",
    description:
      "Choose format, add keywords, hit Generate. Get a polished, SEO-ready piece in seconds. Copy, export, done.",
    icon: "🚀",
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
          background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 60%)",
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display">
            Three steps to <span className="gradient-text">ready content</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Animated connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px overflow-hidden">
            <svg
              className="w-full h-px"
              viewBox="0 0 100 1"
              preserveAspectRatio="none"
            >
              <line
                x1="0" y1="0.5" x2="100" y2="0.5"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>
            <motion.div
              className="absolute top-0 left-0 h-full"
              style={{
                scaleX: lineProgress,
                transformOrigin: "left center",
                background: "linear-gradient(90deg, #7C3AED, #06B6D4, #10B981)",
                height: "1px",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                {/* Number */}
                <div className="relative mb-6">
                  <span
                    className="text-7xl md:text-8xl font-bold font-display"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      opacity: 0.6,
                    }}
                  >
                    {step.number}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-2xl border border-white/10">
                      {step.icon}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
