"use client";

import { motion } from "framer-motion";
import SpotlightCard from "@/components/effects/SpotlightCard";

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Generation",
    description:
      "GPT-4.1 understands context, tone, and your target audience. It doesn't just rewrite — it crafts content that resonates, engages, and converts.",
    span: "col-span-1 md:col-span-2",
    stat: "GPT-4.1",
    statLabel: "Technology",
  },
  {
    icon: "📄",
    title: "Multi-Format Export",
    description:
      "One video. Three formats. SEO long-form articles, LinkedIn posts optimized for engagement, and Twitter threads that go viral.",
    span: "col-span-1",
    stat: "3 formats",
    statLabel: "Supported",
  },
  {
    icon: "🪙",
    title: "Token Economy",
    description:
      "No subscriptions, no wasted budget. Buy word-packs and pay only for the content you actually generate. Start free, scale as you grow.",
    span: "col-span-1",
    stat: "Pay-as-you-go",
    statLabel: "Pricing model",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description:
      "From YouTube link to publish-ready article in under 30 seconds. Stop spending hours writing from scratch — let AI do the heavy lifting.",
    span: "col-span-1 md:col-span-2",
    stat: "< 30s",
    statLabel: "Content in seconds",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Features() {
  return (
    <section id="features" className="section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
            Everything you need to{" "}
            <span className="gradient-text">scale content</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            V2Post handles the hard work so you can focus on growing your audience.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants} className={feature.span}>
              <SpotlightCard className="p-6 md:p-8 h-full group hover:shadow-glow transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-400/20 flex items-center justify-center text-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold text-sm font-display">{feature.stat}</div>
                    <div className="text-slate-600 text-xs">{feature.statLabel}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
