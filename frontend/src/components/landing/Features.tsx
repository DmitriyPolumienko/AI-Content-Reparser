"use client";

import { motion } from "framer-motion";
import SpotlightCard from "@/components/effects/SpotlightCard";

const features = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    description:
      "Extract transcripts and generate publish-ready content in under 30 seconds. No more hours spent writing from scratch.",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: "🤖",
    title: "AI-Powered",
    description:
      "GPT-4.1 understands context, tone, and structure. Every output is tailored for your chosen format and keywords.",
    span: "col-span-1",
  },
  {
    icon: "📄",
    title: "Multi-Format Output",
    description:
      "One transcript, multiple formats: long-form SEO articles, LinkedIn posts, and Twitter threads — all with one click.",
    span: "col-span-1",
  },
  {
    icon: "🔑",
    title: "Keyword Optimization",
    description:
      "Insert mandatory keywords seamlessly. Our AI weaves them naturally into the content, boosting your SEO rank.",
    span: "col-span-1",
  },
  {
    icon: "🪙",
    title: "Token Economy",
    description:
      "Pay only for what you use. Start free, buy word-packs as you grow. No wasted budget, no surprise charges.",
    span: "col-span-1 md:col-span-2",
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
            Everything you need to{" "}
            <span className="gradient-text">scale content</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            From a raw YouTube link to a polished piece of content — all automated.
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/30 flex items-center justify-center text-2xl mb-4 border border-white/10">
                  {feature.icon}
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
