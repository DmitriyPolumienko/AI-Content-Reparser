import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPost {
  slug: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  authorInitials: string;
  content: string;
}

const posts: Record<string, BlogPost> = {
  "how-ai-transforms-video-content": {
    slug: "how-ai-transforms-video-content",
    tag: "SEO",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "How AI Transforms Video Content into SEO Gold",
    excerpt:
      "Content repurposing is the fastest way to grow. Here's the exact workflow we use to extract maximum value from every recording.",
    readTime: "5 min read",
    date: "March 5, 2026",
    author: "Alex Rivera",
    authorRole: "Content Strategy Lead",
    authorInitials: "AR",
    content: `
## The Problem Every Video Creator Faces

You spend hours recording, editing, and publishing a YouTube video. It gets a few thousand views — great! But then what? That same content could be driving SEO traffic, LinkedIn engagement, and newsletter subscribers simultaneously. Most creators leave 90% of their content's value on the table.

This is the content distribution gap. And AI is finally closing it.

## What Makes Video Content Uniquely Valuable for SEO

Video transcripts are gold for search engines. Here's why:

- **Natural language patterns** — people speak in the long-tail keywords Google loves
- **Authoritative depth** — a 30-minute video contains enough content for 5+ blog posts
- **Semantic richness** — natural conversation covers topics from multiple angles
- **E-E-A-T signals** — your expertise and experience come through authentically

The problem historically was extraction. Manually transcribing and reformatting a video into an SEO article took 3-5 hours. AI has reduced this to under a minute.

## The AI Transformation Workflow

Here's the exact process that top content teams now use:

### Step 1: Extract the Transcript

Modern AI tools can pull YouTube transcripts instantly. The key is getting a clean transcript — removing filler words while preserving the substance.

> **Pro tip:** Always review the transcript before generating. The AI extracts what's there — if your video had unclear sections, those will show up in the transcript.

### Step 2: Structure for Search Intent

Raw transcripts don't map to how people search. A great video might answer a question starting at minute 12, but a searcher needs that answer in the first paragraph.

AI content generation tools restructure your video content around search intent:

- **Informational queries** → listicles, how-to guides
- **Commercial queries** → comparison content, feature breakdowns
- **Navigational queries** → branded content, product pages

### Step 3: Add SEO Layer

This is where AI really shines. It can identify the primary keyword from your transcript naturally, add semantic variations without keyword stuffing, generate meta descriptions and title tags, and structure content with proper hierarchy for featured snippets.

### Step 4: Format for Platform

The same transcript becomes different content for different platforms. A blog article, a LinkedIn post, and a Twitter thread all require different formatting and tone — AI handles all three simultaneously.

## Real Numbers from Real Creators

Creators using AI-powered content repurposing report:

- **3-5x more content output** with the same production effort
- **40-60% reduction** in time spent on written content
- **20-35% increase** in organic search traffic within 90 days
- **Consistent publishing** instead of feast-or-famine content calendars

## Getting Started Today

The barrier is genuinely low now. You need a YouTube video with captions, an AI content tool, and 10-15 minutes to review the output.

Your video library is a content goldmine you've already paid for. It's time to start mining it.
    `,
  },
  "seo-strategies-for-video-creators": {
    slug: "seo-strategies-for-video-creators",
    tag: "Strategy",
    tagColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    title: "SEO Strategies Every Video Creator Needs in 2025",
    excerpt:
      "Video SEO is evolving fast. Discover the strategies top creators use to rank their content across multiple platforms simultaneously.",
    readTime: "8 min read",
    date: "February 20, 2026",
    author: "Sarah Chen",
    authorRole: "SEO Strategist",
    authorInitials: "SC",
    content: `
## The Search Landscape Has Changed

If you're a video creator still thinking about SEO as something separate from your content strategy, you're already behind. In 2025, search engines don't just index text — they understand video, prioritize video results for informational queries, and increasingly surface AI-generated summaries.

The creators winning at SEO are treating every video as the seed for a multi-format content ecosystem.

## Platform-Specific SEO: The New Reality

### YouTube SEO (Still King)

YouTube remains the second-largest search engine. But the algorithm has evolved:

- **Watch time still matters most** — but now it's average percentage watched, not raw hours
- **Comments signal depth** — videos that spark discussion get boosted
- **Chapter timestamps** help YouTube understand content structure
- **End screens and cards** affect session watch time — the key signal YouTube cares about most

### Google Search + Video Results

Google now shows video previews, chapters, and key moments directly in SERPs. To capture this:

- Add timestamp descriptions to your YouTube chapters
- Publish a written companion article for each video
- Use VideoObject schema markup on your written content
- Target "How to" and "What is" queries — these trigger video carousels most often

### LinkedIn Video

LinkedIn's algorithm gives massive organic reach to native video. Key tactics:

- Caption every video (LinkedIn auto-plays without sound)
- Post at 7-9 AM or 12-2 PM on Tuesdays through Thursdays
- Engage with comments in the first 60 minutes
- End with a question — LinkedIn rewards comment-generating content

## The Keyword Research Framework for Video Creators

Traditional keyword research doesn't map well to video content. Here's a framework that works:

### 1. Start with YouTube Suggest

Type your topic into YouTube's search bar and collect autocomplete suggestions. These are real searches happening right now.

### 2. Map to Content Clusters

Once you have topic ideas, organize them into content clusters — hub pages supported by multiple videos and articles.

### 3. The FAQ Gold Mine

Every video comment section is a keyword research tool. Questions your viewers ask are questions people are searching for.

## Technical SEO for Video Creators

Often overlooked, but critical:

- **Page speed matters** — use lazy loading for video embeds
- **Transcripts as SEO content** — publishing your full video transcript dramatically improves topical depth
- **Internal linking** — link between related video articles and your main content hub
- **XML sitemaps** — include both written content and video sitemaps

## The Content Velocity Advantage

A creator publishing two videos per week, repurposing each into a long-form article, a LinkedIn post, and a Twitter thread is effectively publishing 8 pieces of content per week. That's compounding content equity.

## Measuring What Matters

Stop obsessing over vanity metrics. Focus on:

- **Organic impressions growth** — are you appearing for more queries?
- **Click-through rate by page** — are your titles and meta descriptions converting?
- **Average position** — are you moving up for your target keywords?
- **Content that drives conversions** — which pieces lead to sign-ups or sales?

Set a 90-day benchmark and review monthly. SEO compounds slowly, then suddenly.
    `,
  },
  "maximizing-content-roi-with-repurposing": {
    slug: "maximizing-content-roi-with-repurposing",
    tag: "Growth",
    tagColor: "text-green-400 bg-green-500/10 border-green-500/20",
    title: "Maximizing Content ROI Through Smart Repurposing",
    excerpt:
      "After analyzing 200 viral content campaigns, we distilled the exact repurposing formula. We've baked it into our AI prompts so you can replicate it instantly.",
    readTime: "4 min read",
    date: "February 8, 2026",
    author: "Marcus Williams",
    authorRole: "Growth Strategist",
    authorInitials: "MW",
    content: `
## Why Most Creators Leave 80% of Their ROI Behind

You spent thousands on production and hours of effort creating a video. Then you post it on YouTube and call it done.

Meanwhile, that same content could be driving traffic from Google, building your LinkedIn following, growing your email list, and establishing authority in your niche — simultaneously, for months or years.

Content ROI isn't just about views. It's about every piece of value you extract from every hour of production.

## The Repurposing Pyramid

Think of your content as a pyramid. Your video is at the top — the primary content. Below it are articles and newsletters. Below those are LinkedIn posts and Twitter threads. At the base are Shorts and quote cards.

Every layer down requires less production effort but reaches additional audiences. A single high-quality video becomes 8-12 pieces of content.

## The 4-Step Repurposing System

### Step 1: Extract the Core Insight

Every good piece of content has a central argument. Before repurposing, articulate it in one sentence. This becomes the through-line for all derivative content.

### Step 2: Match Format to Platform Behavior

Different platforms reward different content behaviors:

- **YouTube** — Long-form, educational, entertainment
- **Blog** — Searchable, in-depth, evergreen
- **LinkedIn** — Professional, insight-driven, conversational
- **Twitter** — Punchy, contrarian, thread-worthy
- **Email** — Personal, actionable, exclusive

The mistake creators make is copying content across platforms. The insight translates — the format must adapt.

### Step 3: Optimize for Platform-Native Engagement

> "On LinkedIn, a post that starts with 'Here's what I learned from 50+ conversations with content creators...' will outperform a post that starts with 'In this article, I discuss...' every time."

Platform-native writing means matching the tone and structure that each platform rewards.

### Step 4: Create a Repurposing Schedule

The best repurposing systems are systematic, not reactive. Build it into your content calendar so every piece of content automatically spawns multiple derivatives.

## The ROI Math

Without repurposing: 1 YouTube video, 10 hours production, ad revenue from views.

With AI-powered repurposing: 1 video plus 1.5 hours of review and scheduling = 1 video + 1 SEO article + 1 LinkedIn post + 1 Twitter thread + email content.

The additional 1.5 hours unlocks ongoing SEO traffic, LinkedIn reach (often 5-10x your video reach), Twitter growth, and email nurturing. That's not 1.5x better ROI. That's potentially 5-10x better ROI for 15% more effort.

## Measuring Repurposing Success

Track these metrics across your repurposed content:

- **Search traffic from articles** — this compounds over time
- **LinkedIn impressions vs. video views** — LinkedIn often wins
- **Twitter thread engagement rate** — threads at 5%+ engagement are winners
- **Email click-through rate** — your most engaged audience

Within 90 days of systematic repurposing, most creators see a 2-3x increase in total content reach without increasing production time.

## The Mindset Shift

Stop thinking of your video as the end product. It's the raw material.

The video is the mining operation. Repurposing is the refinery that extracts the actual value.
    `,
  },
};

const allPosts = [
  {
    slug: "how-ai-transforms-video-content",
    title: "How AI Transforms Video Content into SEO Gold",
    readTime: "5 min read",
  },
  {
    slug: "seo-strategies-for-video-creators",
    title: "SEO Strategies Every Video Creator Needs in 2025",
    readTime: "8 min read",
  },
  {
    slug: "maximizing-content-roi-with-repurposing",
    title: "Maximizing Content ROI Through Smart Repurposing",
    readTime: "4 min read",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — AI Content Reparser Blog`,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold text-white font-display mt-10 mb-4">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-xl font-bold text-white font-display mt-8 mb-3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-emerald-500 pl-5 my-6 text-slate-300 italic"
        >
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="list-none space-y-2 my-4">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-slate-400 text-base">
              <span className="text-emerald-400 mt-1 shrink-0">•</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: item.replace(
                    /\*\*(.+?)\*\*/g,
                    "<strong class='text-white'>$1</strong>"
                  ),
                }}
              />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      elements.push(
        <p
          key={i}
          className="text-slate-400 text-base leading-relaxed my-4"
          dangerouslySetInnerHTML={{
            __html: line.replace(
              /\*\*(.+?)\*\*/g,
              "<strong class='text-white font-semibold'>$1</strong>"
            ),
          }}
        />
      );
    }
    i++;
  }

  return elements;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Blog
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
            >
              Try Free →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero area */}
        <div
          className="rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(4,120,87,0.05) 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mb-4 ${post.tagColor}`}
            >
              {post.tag}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-slate-400 text-lg mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                {post.authorInitials}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{post.author}</div>
                <div className="text-slate-500 text-xs">{post.authorRole}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-slate-500 text-xs">{post.date}</div>
                <div className="text-emerald-400 text-xs">{post.readTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Article content */}
        <article>{renderContent(post.content)}</article>

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(4,120,87,0.05))",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <h3 className="text-2xl font-bold text-white font-display mb-3">
            Ready to transform your video content?
          </h3>
          <p className="text-slate-400 mb-6">
            Start repurposing your YouTube videos into SEO articles, LinkedIn posts, and Twitter
            threads — in seconds.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 0 30px rgba(16,185,129,0.3)",
            }}
          >
            Start Creating for Free →
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white font-display mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-emerald-500/20 transition-all duration-300 group"
                >
                  <h4 className="text-white font-semibold text-sm group-hover:text-emerald-300 transition-colors mb-2 leading-snug">
                    {r.title}
                  </h4>
                  <p className="text-slate-600 text-xs">{r.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
