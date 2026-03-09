"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const posts = [
  {
    tag: "SEO",
    title: "How to Turn a 1-Hour Podcast into 10 Pieces of Content",
    excerpt:
      "Content repurposing is the fastest way to grow. Here's the exact workflow we use to extract maximum value from every recording.",
    readTime: "5 min read",
  },
  {
    tag: "AI",
    title: "GPT-4 vs GPT-4.1 for Content Generation: What Changed?",
    excerpt:
      "We ran 500 content generation tests to compare models. The results surprised us — especially for SEO long-form content.",
    readTime: "8 min read",
  },
  {
    tag: "Growth",
    title: "The Twitter Thread Formula That Gets 1,000+ Likes Every Time",
    excerpt:
      "After analyzing 200 viral threads, we distilled the exact structure. We've baked it into our AI prompts so you can replicate it instantly.",
    readTime: "4 min read",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="section-padding bg-slate-900/40">
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
              Blog
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Read Our <span className="gradient-text">Latest Insights</span>
            </h2>
          </div>
          <Button variant="outline">View All Posts →</Button>
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
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card p-6 h-full flex flex-col hover:border-white/20 cursor-pointer group"
              >
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 w-fit">
                  {post.tag}
                </span>
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-blue-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{post.excerpt}</p>
                <p className="text-slate-600 text-xs mt-4">{post.readTime}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
