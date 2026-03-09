'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link2, FileText, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Paste Your Video URL',
    description:
      'Drop any YouTube link into our dashboard. We instantly extract the transcript with full accuracy.',
    detail: 'youtube.com/watch?v=...',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Review & Edit Transcript',
    description:
      'See the raw transcript, make any edits, choose your content format, and add target keywords.',
    detail: 'SEO Article · LinkedIn · Twitter',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Generate & Publish',
    description:
      'GPT-4.1 crafts your content in seconds. Copy, download, or publish directly to your platform.',
    detail: 'Ready in < 30 seconds',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-violet-900/10 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="chip mb-4">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Three steps to{' '}
            <span className="text-gradient">viral content</span>
          </h2>
          <p className="max-w-2xl mx-auto text-white/60 text-lg">
            No writing skills needed. Just paste, configure, and publish.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-px">
            <svg
              className="w-full h-4 overflow-visible"
              viewBox="0 0 800 4"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="2"
                x2="800"
                y2="2"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeDasharray="6 4"
                className={isInView ? 'opacity-100' : 'opacity-0'}
                style={{ transition: 'opacity 1s ease' }}
              />
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className="relative"
              >
                <div className="glass border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover group">
                  {/* Step number */}
                  <div className="text-5xl font-extrabold text-gradient mb-4 leading-none">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 flex items-center justify-center mb-4 group-hover:glow transition-all duration-300">
                    <step.icon className="w-5 h-5 text-violet-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{step.description}</p>

                  {/* Detail pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 font-mono">
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
