"use client";

import { motion } from "framer-motion";

const featured = {
  quote:
    "V2Post cut my content production time by 80%. I used to spend 3 hours writing one article. Now it takes 10 minutes. This tool is an absolute game-changer for creators.",
  name: "Alex Rivera",
  role: "YouTube Creator · 2.1M Subscribers",
};

const testimonials = [
  {
    text: "I was skeptical at first, but the quality blew me away. The SEO articles are actually readable, not robotic. My organic traffic jumped 140% in 3 months.",
    name: "Sarah Chen",
    role: "Content Strategist at TechFlow",
    initials: "SC",
    color: "from-emerald-600 to-teal-500",
  },
  {
    text: "Finally a tool that understands my niche. The keyword insertion is natural, not forced. My LinkedIn posts now consistently hit 1000+ engagements.",
    name: "Marcus Williams",
    role: "B2B Marketing Director",
    initials: "MW",
    color: "from-emerald-500 to-green-400",
  },
  {
    text: "The speed is insane. Drop a link, pick a format, get content. I've repurposed my entire 200-video archive into blog posts in two weekends.",
    name: "Priya Patel",
    role: "Podcast Host & Writer",
    initials: "PP",
    color: "from-teal-500 to-emerald-400",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-padding relative overflow-hidden">
      {/* Subtle bg glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
            Loved by <span className="gradient-text">creators worldwide</span>
          </h2>
        </motion.div>

        {/* Featured quote */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-3xl p-8 md:p-12 mb-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-4 left-6 text-7xl gradient-text opacity-50 font-serif leading-none select-none">
            "
          </div>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-medium mb-8 relative z-10">
            {featured.quote}
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
              AR
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">{featured.name}</div>
              <div className="text-slate-400 text-xs">{featured.role}</div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}
              className="glass-card p-6 flex flex-col gap-4 cursor-default"
            >
              {/* Stars — gold colored */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
