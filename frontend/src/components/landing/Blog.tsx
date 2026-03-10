"use client";

import { motion } from "framer-motion";

const posts = [
  {
    tag: "SEO",
    tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    title: "How to Turn a 1-Hour Podcast into 10 Pieces of Content",
    excerpt:
      "Content repurposing is the fastest way to grow. Here's the exact workflow we use to extract maximum value from every recording.",
    readTime: "5 min read",
  },
  {
    tag: "AI",
    tagColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    title: "GPT-4 vs GPT-4.1 for Content Generation: What Changed?",
    excerpt:
      "We ran 500 content generation tests to compare models. The results surprised us — especially for SEO long-form content.",
    readTime: "8 min read",
  },
  {
    tag: "Growth",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "The Twitter Thread Formula That Gets 1,000+ Likes Every Time",
    excerpt:
      "After analyzing 200 viral threads, we distilled the exact structure. We've baked it into our AI prompts so you can replicate it instantly.",
    readTime: "4 min read",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              Blog
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold font-display">
              Latest <span className="gradient-text">Insights</span>
            </h2>
          </div>
          <a
            href="#"
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 shrink-0"
          >
            View All Posts →
          </a>
        </motion.div>

        {/* Post cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-6 h-full flex flex-col hover:border-white/20 cursor-pointer group hover:shadow-glow transition-all duration-300"
            >
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mb-4 w-fit ${post.tagColor}`}
              >
                {post.tag}
              </span>
              <h3 className="text-white font-bold text-lg mb-3 group-hover:gradient-text transition-colors leading-snug font-display">
                {post.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{post.excerpt}</p>
              <p className="text-slate-600 text-xs mt-4">{post.readTime}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
