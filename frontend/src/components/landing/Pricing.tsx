"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerButton from "@/components/effects/ShimmerButton";

interface PlanFeature {
  text: string;
  tooltip?: string;
}

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: PlanFeature[];
  cta: string;
  highlight: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for trying out AI content generation.",
    features: [
      { text: "18,000 symbols / week", tooltip: "≈ 10–15 min video (average)" },
      { text: "Max request: 3k input / 3k output" },
      { text: "YouTube support" },
      { text: "Basic SEO optimization" },
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    monthlyPrice: 11.99,
    annualPrice: 7.79,
    description: "For creators serious about scaling their content.",
    features: [
      { text: "90,000 symbols / day", tooltip: "≈ 60 min video (average)" },
      { text: "Max request: 50k input / 20k output" },
      { text: "All content types" },
      { text: "All platforms (YouTube, Twitch, TikTok)" },
      { text: "Advanced SEO + keyword optimization" },
      { text: "Priority AI processing" },
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 27.99,
    annualPrice: 18.19,
    description: "Unlimited scale for teams and agencies.",
    features: [
      { text: "360,000 symbols / day", tooltip: "≈ 4 hours video (average)" },
      { text: "Max request: 150k input / 30k output" },
      { text: "All content types" },
      { text: "API access" },
      { text: "Team collaboration" },
      { text: "White-label exports" },
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(6,182,212,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg mb-8">
            Start free. Scale as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 glass px-4 py-2 rounded-full">
            <span className={`text-sm font-medium transition-colors ${!annual ? "text-white" : "text-slate-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual((v) => !v)}
              className="relative w-12 h-6 rounded-full transition-colors duration-300"
              style={{ background: annual ? "linear-gradient(135deg,#10B981,#059669)" : "rgba(255,255,255,0.1)" }}
              aria-label="Toggle annual billing"
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ left: annual ? "calc(100% - 20px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? "text-white" : "text-slate-500"}`}>
              Annual
              <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                Save 35%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 transition-transform duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "border border-emerald-500/50 shadow-glow"
                  : "glass-card"
              }`}
              style={
                plan.highlight
                  ? { background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))", backdropFilter: "blur(20px)" }
                  : {}
              }
            >
              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="px-4 py-1 text-xs font-bold text-white rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      animation: "glow-pulse 2s ease-in-out infinite",
                    }}
                  >
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div>
                <h3 className="text-lg font-bold text-white font-display mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={annual ? "annual" : "monthly"}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-end gap-1"
                  >
                    <span className="text-4xl font-bold gradient-text font-display">
                      ${annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-400 text-sm pb-1">/ month</span>
                  </motion.div>
                </AnimatePresence>
                {annual && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">Billed annually (${(plan.annualPrice * 12).toFixed(2)}/yr)</p>
                )}
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-emerald-400 font-bold shrink-0">✓</span>
                    <span className="flex items-center gap-1.5">
                      {f.text}
                      {f.tooltip && (
                        <span
                          title={f.tooltip}
                          aria-label={f.tooltip}
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/20 cursor-help text-xs leading-none transition-colors flex-shrink-0"
                        >
                          i
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.highlight ? (
                <ShimmerButton className="w-full justify-center">{plan.cta}</ShimmerButton>
              ) : (
                <button className="w-full py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium">
                  {plan.cta}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Overage / additional credits note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          Need more symbols?{" "}
          <a href="#" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
            Purchase additional credits
          </a>{" "}
          — overage is billed at end of month together with your subscription.
        </motion.p>
      </div>
    </section>
  );
}
