"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ShimmerButton from "@/components/effects/ShimmerButton";
import GradientOrbs from "@/components/effects/GradientOrbs";

export default function CTASection() {
  return (
    <section className="relative py-28 px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 50%, rgba(4,120,87,0.06) 100%)",
        }}
      />
      <GradientOrbs />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            🚀 Start Today
          </span>
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
            Ready to Transform{" "}
            <span className="gradient-text">Your Content?</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of creators who save 80% of their content creation time.
            Start free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <ShimmerButton size="lg">
                Start Creating for Free →
              </ShimmerButton>
            </Link>
            <button className="px-8 py-4 text-slate-400 hover:text-white border border-white/10 rounded-xl transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5">
              View Live Demo
            </button>
          </div>
          <p className="text-slate-600 text-sm mt-6">
            5,000 words free every month • No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
