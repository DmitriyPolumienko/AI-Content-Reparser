"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is V2Post and how does it help content creators?",
    answer:
      "V2Post is an AI-powered content repurposing tool that instantly transforms YouTube video transcripts into high-quality, publish-ready content — SEO articles, LinkedIn posts, Twitter threads, and video recaps. Instead of spending hours rewriting, creators paste a YouTube URL and get optimized content in under 30 seconds.",
  },
  {
    question: "How does V2Post convert YouTube videos into SEO articles?",
    answer:
      "V2Post extracts the transcript from your YouTube video (in any available language), then uses advanced GPT-5 AI to restructure it into a fully formatted SEO article — complete with an optimized H1 title, meta description, H2/H3 headings, bullet lists, an FAQ section, and a CTA. The AI follows strict SEO guidelines to maximize your content's chance of ranking on Google.",
  },
  {
    question: "Which content formats does V2Post support?",
    answer:
      "V2Post currently supports four content formats: SEO Articles (long-form blog posts optimized for Google ranking), LinkedIn Posts (professional posts with hooks, emoji lists, and hashtags), Twitter/X Threads (5–10 punchy viral tweets), and Video Recaps (concise summaries that capture the key takeaways from any video).",
  },
  {
    question: "Does V2Post work with videos in languages other than English?",
    answer:
      "Yes — V2Post works with YouTube videos in any language that has available captions or subtitles. The AI generates all output content in the same language as the video transcript. Whether your audience is Russian, Spanish, German, French, or any other language, you get natively written content without translation.",
  },
  {
    question: "Can I customize the tone and length of the generated content?",
    answer:
      "Absolutely. For each content type you can choose from multiple tones of voice — for example, Professional/Expert, Conversational/Friendly, Provocative/Bold, or Educational/Instructional for SEO articles. You can also set the target content length from a quick Micro-Post (1,500–2,500 chars) all the way to a Deep Dive Analysis (10,000–20,000 chars), giving you full control over the output.",
  },
  {
    question: "What is the Video Recap content type best used for?",
    answer:
      "Video Recap is ideal for repurposing educational videos, webinars, interviews, or tutorials. It produces a structured summary — a concise title, 2–4 sentence overview, key takeaways, memorable quotes, and actionable recommendations — in the same language as the video. It's perfect for newsletters, community updates, or social proof snippets that drive viewers back to the original video.",
  },
  {
    question: "How does the 'Include Source Link' feature work?",
    answer:
      "When you enable 'Include Source Link', V2Post automatically appends a call-to-action with your video URL at the end of the generated content. This is especially powerful for LinkedIn posts and Twitter threads, as it drives referral traffic from your written content back to your YouTube channel, boosting your video views and subscriber count organically.",
  },
  {
    question: "Is V2Post suitable for YouTube channels in niche industries?",
    answer:
      "Yes — V2Post is built for any niche. Whether you run a finance channel, a fitness channel, a B2B SaaS podcast, or a language-learning series, the AI adapts to your transcript's terminology and context. You can also add custom keywords that will be naturally woven throughout the article to strengthen topical authority and SEO relevance for your specific niche.",
  },
  {
    question: "How many characters can I generate per session?",
    answer:
      "Each account comes with a character balance that is consumed per generation. The exact amount depends on the content type and selected length. Your remaining character balance is always visible in the dashboard header so you can plan your usage. Additional character packs can be purchased at any time directly from the dashboard.",
  },
  {
    question: "Why is repurposing YouTube content important for SEO?",
    answer:
      "Google cannot index video content directly. By converting your YouTube transcripts into structured, keyword-rich articles, you create indexable text pages that can rank in search results — effectively doubling the reach of every video you publish. This strategy, known as content repurposing, is used by top content marketers to multiply organic traffic without producing entirely new content from scratch.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function DashboardFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Everything you need to know about turning YouTube videos into high-ranking written content with AI.
        </p>
      </div>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-medium text-slate-200">{item.question}</span>
              <ChevronIcon open={openIndex === i} />
            </button>

            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
