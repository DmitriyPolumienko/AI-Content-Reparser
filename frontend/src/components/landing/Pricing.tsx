"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect to try the platform.",
    words: "5,000 words/month",
    features: [
      "5,000 word credits",
      "YouTube transcript extraction",
      "SEO Article format",
      "1 user",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For solo creators & marketers.",
    words: "100,000 words/month",
    features: [
      "100,000 word credits",
      "YouTube transcript extraction",
      "All content formats",
      "Keyword targeting",
      "Priority support",
      "Buy extra word-packs",
    ],
    cta: "Start Pro",
    href: "/dashboard",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "/month",
    description: "For agencies & large teams.",
    words: "Unlimited words",
    features: [
      "Unlimited word credits",
      "All content formats",
      "API access",
      "Team collaboration (10 users)",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/dashboard",
    highlighted: false,
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

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Start free. Scale as you grow. Buy extra word-packs anytime — no subscriptions forced.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={cardVariants} className="relative">
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-blue-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`h-full flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-blue-600/20 to-violet-600/10 border-blue-500/40 shadow-xl shadow-blue-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                  <p className="text-blue-400 text-sm font-medium mt-1">{plan.words}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    variant={plan.highlighted ? "primary" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
