'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'YouTube Creator · 500K subs',
    avatar: 'AC',
    color: 'from-violet-600 to-purple-600',
    text: 'I went from spending 4 hours writing one article to publishing 3 pieces of content in under an hour. This tool is insane.',
    stars: 5,
  },
  {
    name: 'Sarah Mitchell',
    role: 'Content Strategist',
    avatar: 'SM',
    color: 'from-cyan-600 to-blue-600',
    text: 'The SEO optimization is genuinely impressive. My articles rank on page 1 for competitive keywords — something that took months before.',
    stars: 5,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Podcast Host',
    avatar: 'MR',
    color: 'from-emerald-600 to-teal-600',
    text: 'I repurpose every episode into a full LinkedIn post and Twitter thread. My engagement tripled in the first month.',
    stars: 5,
  },
  {
    name: 'Emma Liu',
    role: 'Course Creator',
    avatar: 'EL',
    color: 'from-pink-600 to-rose-600',
    text: 'The keyword integration is natural, not forced. My students even asked if I hired a professional copywriter!',
    stars: 5,
  },
  {
    name: 'Tom Becker',
    role: 'Marketing Lead',
    avatar: 'TB',
    color: 'from-amber-600 to-orange-600',
    text: 'We use this for our entire team\'s content pipeline. The ROI is unbelievable — saved us $3,000/month in writer fees.',
    stars: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Tech Blogger',
    avatar: 'PS',
    color: 'from-violet-600 to-cyan-600',
    text: 'The Twitter thread format is perfect. Each tweet is well-crafted and the whole thread reads naturally. Love it.',
    stars: 5,
  },
];

function StarRating({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="chip mb-4">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Creators <span className="text-gradient">love it</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Join thousands of creators who repurpose their content 10x faster.
          </p>
        </motion.div>

        {/* Featured quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative glass border border-white/10 rounded-2xl p-8 md:p-12 mb-12 text-center overflow-hidden"
        >
          <div className="absolute top-4 left-6 text-8xl text-violet-500/20 font-serif leading-none">"</div>
          <p className="relative z-10 text-xl md:text-2xl font-medium text-white/90 max-w-3xl mx-auto leading-relaxed">
            I went from spending 4 hours writing one article to publishing 3 pieces of content in under an hour.
            AI Content Reparser is a game-changer for anyone serious about content marketing.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-sm font-bold">
              AC
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Alex Chen</p>
              <p className="text-white/40 text-xs">YouTube Creator · 500K subscribers</p>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.slice(1).map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 group"
            >
              <StarRating count={t.stars} />
              <p className="mt-4 text-white/70 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
