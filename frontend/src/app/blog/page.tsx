import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — AI Content Reparser",
  description: "Insights on AI content creation, SEO strategies, and video repurposing for creators.",
};

const posts = [
  {
    tag: "SEO",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "How AI Transforms Video Content into SEO Gold",
    excerpt:
      "Content repurposing is the fastest way to grow. Here's the exact workflow we use to extract maximum value from every recording.",
    readTime: "5 min read",
    date: "March 5, 2026",
    slug: "how-ai-transforms-video-content",
  },
  {
    tag: "Strategy",
    tagColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    title: "SEO Strategies Every Video Creator Needs in 2025",
    excerpt:
      "Video SEO is evolving fast. Discover the strategies top creators use to rank their content across multiple platforms simultaneously.",
    readTime: "8 min read",
    date: "February 20, 2026",
    slug: "seo-strategies-for-video-creators",
  },
  {
    tag: "Growth",
    tagColor: "text-green-400 bg-green-500/10 border-green-500/20",
    title: "Maximizing Content ROI Through Smart Repurposing",
    excerpt:
      "After analyzing 200 viral content campaigns, we distilled the exact repurposing formula. We've baked it into our AI prompts so you can replicate it instantly.",
    readTime: "4 min read",
    date: "February 8, 2026",
    slug: "maximizing-content-roi-with-repurposing",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#030014] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="font-bold text-white text-sm font-display">
              Content{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Reparser
              </span>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            Get Started →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Page header */}
        <div className="mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-display mb-4">
            Latest{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10B981, #059669, #047857)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Insights
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Practical guides on AI content creation, SEO strategies, and how to scale your content output.
          </p>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col hover:border-emerald-500/20 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${post.tagColor}`}
                >
                  {post.tag}
                </span>
                <span className="text-slate-600 text-xs">{post.date}</span>
              </div>
              <h2 className="text-white font-bold text-lg mb-3 group-hover:text-emerald-300 transition-colors leading-snug font-display flex-1">
                {post.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-slate-600 text-xs">{post.readTime}</span>
                <span className="text-emerald-400 text-xs group-hover:text-emerald-300 transition-colors">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
