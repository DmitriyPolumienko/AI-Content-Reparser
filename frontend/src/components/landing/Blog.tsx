"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const posts = [
  {
    tag: "SEO",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "How AI Transforms Video Content into SEO Gold",
    excerpt:
      "Content repurposing is the fastest way to grow. Here's the exact workflow we use to extract maximum value from every recording.",
    readTime: "5 min read",
    slug: "how-ai-transforms-video-content",
  },
  {
    tag: "Strategy",
    tagColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    title: "SEO Strategies Every Video Creator Needs in 2025",
    excerpt:
      "Video SEO is evolving fast. Discover the strategies top creators use to rank their content across multiple platforms simultaneously.",
    readTime: "8 min read",
    slug: "seo-strategies-for-video-creators",
  },
  {
    tag: "Growth",
    tagColor: "text-green-400 bg-green-500/10 border-green-500/20",
    title: "Maximizing Content ROI Through Smart Repurposing",
    excerpt:
      "After analyzing 200 viral content campaigns, we distilled the exact repurposing formula. We've baked it into our AI prompts so you can replicate it instantly.",
    readTime: "4 min read",
    slug: "maximizing-content-roi-with-repurposing",
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              Blog
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold font-display">
              Latest <span className="gradient-text">Insights</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 shrink-0"
          >
            View All Posts →
          </Link>
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
            >
              <Link
                href={`/blog/${post.slug}`}
                className="glass-card p-6 h-full flex flex-col hover:border-emerald-500/20 cursor-pointer group hover:shadow-glow transition-all duration-300 block"
              >
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mb-4 w-fit ${post.tagColor}`}
                >
                  {post.tag}
                </span>
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-emerald-300 transition-colors leading-snug font-display">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{post.excerpt}</p>
                <p className="text-slate-600 text-xs mt-4">{post.readTime}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
