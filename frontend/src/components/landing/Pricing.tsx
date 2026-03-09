'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import ShimmerButton from '@/components/effects/ShimmerButton';

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for trying it out',
    tokens: '5,000',
    color: 'border-white/10',
    features: [
      '5,000 word tokens/month',
      '3 content types',
      'YouTube support',
      'Copy to clipboard',
      'Community support',
    ],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 19,
    description: 'For serious content creators',
    tokens: '100,000',
    color: 'border-violet-500/50',
    features: [
      '100,000 word tokens/month',
      'All content types',
      'YouTube + more platforms',
      'Download as .docx / .md',
      'SEO keyword integration',
      'Priority generation',
      'Email support',
    ],
    cta: 'Start Pro Trial',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 99,
    annualPrice: 79,
    description: 'For teams and agencies',
    tokens: 'Unlimited',
    color: 'border-cyan-500/30',
    features: [
      'Unlimited word tokens',
      'All Pro features',
      'Team workspace (5 seats)',
      'API access',
      'Custom brand voice',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* BG accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="chip mb-4">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Simple, <span className="text-gradient">transparent</span> pricing
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Start free. Scale as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 glass border border-white/10 rounded-full px-4 py-2">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-white/50'}`}>Monthly</span>
            <button
              onClick={() => setAnnual((prev) => !prev)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                annual ? 'bg-violet-600' : 'bg-white/20'
              }`}
              role="switch"
              aria-checked={annual}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  annual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-white/50'}`}>
              Annual
              <span className="ml-2 text-xs text-emerald-400 font-medium">Save 35%</span>
            </span>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative glass border ${plan.color} rounded-2xl p-6 ${
                plan.highlight ? 'ring-1 ring-violet-500/50 shadow-glow scale-[1.02]' : ''
              } hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-white animate-pulse-glow">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-white/50 mb-4">{plan.description}</p>

                <div className="flex items-end gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={annual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-extrabold text-white"
                    >
                      ${annual ? plan.annualPrice : plan.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-white/40 text-sm mb-1">/mo</span>
                  )}
                </div>

                <div className="mt-2 text-sm text-white/50">
                  <Zap className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                  {plan.tokens} word tokens
                </div>
              </div>

              <Link href="/dashboard">
                <ShimmerButton
                  variant={plan.highlight ? 'primary' : 'outline'}
                  fullWidth
                  className="mb-6"
                >
                  {plan.cta}
                </ShimmerButton>
              </Link>

              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Add-on tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 glass border border-white/10 rounded-2xl p-6 text-center"
        >
          <p className="text-white/60 text-sm">
            Need more tokens?{' '}
            <span className="text-violet-400 font-medium">Buy add-on packs</span>
            {' '}— 50,000 words for just{' '}
            <span className="text-white font-bold">$9</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
