'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

const posts = [
  {
    category: 'Strategy',
    title: 'How to Turn 1 YouTube Video Into 10 Pieces of Content',
    excerpt: 'Learn the content repurposing framework that top creators use to maximize ROI from every video.',
    readTime: '5 min read',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    category: 'SEO',
    title: 'The AI-Powered SEO Article Formula That Actually Ranks',
    excerpt: 'Discover how AI-generated content outperforms human-written articles when done right.',
    readTime: '7 min read',
    gradient: 'from-cyan-600 to-blue-600',
  },
  {
    category: 'LinkedIn',
    title: '10x Your LinkedIn Impressions With Video-to-Post Strategy',
    excerpt: 'Your video content is a goldmine. Here\'s how to extract maximum value for LinkedIn growth.',
    readTime: '4 min read',
    gradient: 'from-emerald-600 to-teal-600',
  },
];

export default function Blog() {
  return (
    <section id="blog" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="chip mb-3">Blog</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">
              Learn & <span className="text-gradient">grow</span>
            </h2>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all posts <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 group cursor-pointer"
            >
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${post.gradient}`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/60">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-white font-bold mb-3 leading-snug group-hover:text-violet-300 transition-colors">
                  {post.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-400 font-medium group-hover:gap-2 transition-all">
                  <BookOpen className="w-3.5 h-3.5" />
                  Read article
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
