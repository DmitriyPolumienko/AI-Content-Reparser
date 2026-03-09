"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-blue-600/20 via-violet-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          Powered by GPT-4.1
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
        >
          Turn Any Video Into{" "}
          <span className="gradient-text">SEO-Optimized Content</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Paste a YouTube URL and get a publish-ready SEO article, LinkedIn post,
          or Twitter thread — in seconds. No editing required.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">
              Start for Free →
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.p variants={itemVariants} className="mt-10 text-sm text-slate-500">
          Trusted by <span className="text-white font-semibold">2,000+</span> content creators
        </motion.p>

        {/* Demo preview card */}
        <motion.div
          variants={itemVariants}
          className="mt-16 glass-card p-6 text-left max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-500 text-xs ml-2">dashboard.ai-content-reparser.com</span>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg animate-pulse" />
            <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
