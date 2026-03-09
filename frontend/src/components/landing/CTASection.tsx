'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ShimmerButton from '@/components/effects/ShimmerButton';
import GradientOrbs from '@/components/effects/GradientOrbs';
import GridPattern from '@/components/effects/GridPattern';

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-transparent to-cyan-900/20" />
      <GradientOrbs />
      <GridPattern />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="chip mb-6">Get Started Today</span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Transform{' '}
            <span className="text-gradient block">Your Content?</span>
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Join thousands of creators who repurpose video content into articles,
            posts, and threads in seconds. Start free today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <ShimmerButton size="lg">
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </ShimmerButton>
            </Link>
            <p className="text-sm text-white/40">No credit card required</p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '10K+', label: 'Creators' },
              { value: '1M+', label: 'Articles generated' },
              { value: '30s', label: 'Average time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-gradient">{stat.value}</p>
                <p className="text-sm text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
