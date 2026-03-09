'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Globe,
  Coins,
  Zap,
  Users,
  BarChart3,
} from 'lucide-react';
import SpotlightCard from '@/components/effects/SpotlightCard';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Content Generation',
    description:
      'GPT-4.1 transforms any video transcript into polished, publication-ready content. Articles, posts, threads — all perfectly formatted.',
    size: 'large',
    gradient: 'from-violet-600 to-purple-600',
    preview: (
      <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/5 text-left">
        <div className="text-xs text-white/40 mb-2">Generated SEO Article</div>
        <div className="space-y-1.5">
          {['# How AI is Revolutionizing Content', '## Key Takeaways', '### For Creators...'].map((line) => (
            <div key={line} className="h-2.5 rounded-full bg-white/10" style={{ width: `${40 + Math.random() * 50}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Globe,
    title: 'Multi-Format Export',
    description: 'One video → SEO article, LinkedIn post, or Twitter thread with one click.',
    size: 'medium',
    gradient: 'from-cyan-600 to-blue-600',
  },
  {
    icon: Coins,
    title: 'Token Economy',
    description: 'Pay only for what you use. Buy word-tokens in flexible bundles.',
    size: 'medium',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Results in under 30 seconds. No waiting, no queues.',
    size: 'medium',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Built for Creators',
    description:
      'YouTubers, podcasters, coaches — repurpose content for every platform where your audience lives.',
    size: 'wide',
    gradient: 'from-pink-600 to-rose-600',
    preview: (
      <div className="mt-3 flex gap-2 flex-wrap">
        {['YouTube', 'LinkedIn', 'Twitter', 'Blog', 'Newsletter'].map((platform) => (
          <span
            key={platform}
            className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-white/70"
          >
            {platform}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: 'SEO Optimized',
    description: 'Every output includes natural keyword integration and structured headings.',
    size: 'medium',
    gradient: 'from-violet-600 to-cyan-600',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="chip mb-4">Features</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Everything you need to{' '}
            <span className="text-gradient">10x your content</span>
          </h2>
          <p className="max-w-2xl mx-auto text-white/60 text-lg">
            From raw transcript to published article in seconds. No writing skills required.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={
                feature.size === 'large'
                  ? 'md:col-span-2'
                  : feature.size === 'wide'
                  ? 'md:col-span-3'
                  : 'md:col-span-1'
              }
            >
              <SpotlightCard className="h-full glass border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-card-hover">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                {feature.preview}
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
