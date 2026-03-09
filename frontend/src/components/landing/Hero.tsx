'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, BarChart3 } from 'lucide-react';
import GradientOrbs from '@/components/effects/GradientOrbs';
import StarField from '@/components/effects/StarField';
import GridPattern from '@/components/effects/GridPattern';
import ShimmerButton from '@/components/effects/ShimmerButton';
import TypewriterText from '@/components/effects/TypewriterText';

const floatingBadges = [
  { label: 'Powered by GPT-4.1', icon: Sparkles, delay: 0.6 },
  { label: '10x Faster', icon: Zap, delay: 0.8 },
  { label: 'SEO Optimized', icon: BarChart3, delay: 1.0 },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Backgrounds */}
      <GradientOrbs />
      <StarField count={100} />
      <GridPattern />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-sm text-violet-300 mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Content Generation</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4"
        >
          Turn Videos Into{' '}
          <span className="text-gradient block md:inline">
            <TypewriterText
              texts={['Viral Articles', 'LinkedIn Posts', 'Twitter Threads', 'SEO Content']}
              typingSpeed={70}
              deletingSpeed={40}
              pauseTime={2500}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-10"
        >
          Paste any YouTube URL — get a fully formatted, SEO-optimized article,
          LinkedIn post, or Twitter thread in seconds. Powered by GPT-4.1.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/dashboard">
            <ShimmerButton size="lg">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </ShimmerButton>
          </Link>
          <a href="#how-it-works">
            <ShimmerButton size="lg" variant="outline">
              See How It Works
            </ShimmerButton>
          </a>
        </motion.div>

        {/* Floating badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          {floatingBadges.map((badge) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: badge.delay, type: 'spring', stiffness: 200 }}
              className="chip"
            >
              <badge.icon className="w-3.5 h-3.5" />
              {badge.label}
            </motion.div>
          ))}
        </motion.div>

        {/* App Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.7, type: 'spring', stiffness: 80 }}
          style={{ perspective: '1000px' }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-card-hover">
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 h-5 rounded-full bg-white/5 text-xs text-white/30 flex items-center px-3">
                app.aireparser.com/dashboard
              </div>
            </div>

            {/* Mock dashboard UI */}
            <div className="p-6 bg-[#030014]">
              <div className="flex gap-4 mb-6">
                {['01 URL', '02 Edit', '03 Settings', '04 Result'].map((step, i) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 text-xs font-medium ${
                      i === 0 ? 'text-violet-400' : 'text-white/30'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        i === 0
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {i + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>
              <div className="h-10 rounded-xl bg-white/5 border border-white/10 mb-4 flex items-center px-4">
                <span className="text-white/20 text-sm">https://youtube.com/watch?v=...</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 rounded-xl bg-white/3 border border-white/8" />
                <div className="h-20 rounded-xl bg-white/3 border border-white/8" />
              </div>
            </div>
          </div>

          {/* Glow underneath */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
