"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    question: "What is V2Post?",
    answer:
      "V2Post is an AI-powered SaaS tool that converts YouTube videos into publication-ready content like SEO articles, LinkedIn posts, and Twitter threads. Simply paste a YouTube URL and V2Post automatically extracts the transcript and transforms it into well-structured written content.",
  },
  {
    question: "How does V2Post extract content from YouTube videos?",
    answer:
      "V2Post uses advanced AI to automatically extract and process video subtitles/transcripts. It works with both auto-generated captions and manually added subtitles. The extracted transcript is then transformed into well-structured, publication-ready written content using GPT-4.1.",
  },
  {
    question: "What content formats can V2Post generate?",
    answer:
      "V2Post can generate SEO-optimized blog articles, LinkedIn posts, and Twitter/X threads from any YouTube video with captions. Each format is specifically tailored for its platform — articles include proper headings and keyword placement, LinkedIn posts are professional and engaging, and Twitter threads are concise and shareable.",
  },
  {
    question: "Do I need a YouTube Premium account to use V2Post?",
    answer:
      "No! V2Post works with any publicly available YouTube video that has auto-generated or manually added captions. YouTube Premium is not required. The only requirement is that the video has captions enabled.",
  },
  {
    question: "How does the token system work?",
    answer:
      "V2Post uses a word-based token system. Each plan includes a set number of words per month. You only pay for the content you generate, and tokens are only consumed when content is successfully generated. You can track your remaining balance in the dashboard and purchase additional tokens anytime.",
  },
  {
    question: "Is the generated content SEO-optimized?",
    answer:
      "Yes! V2Post's AI is specifically tuned to produce content with proper heading structure (H1, H2, H3), strategic keyword placement, optimal content length, and readability scores optimized for search engines. You can also add your own target keywords before generation to further enhance SEO performance.",
  },
  {
    question: "Can I edit the content before it's generated?",
    answer:
      "Absolutely! V2Post shows you the extracted transcript first, allowing you to edit, remove irrelevant sections, or add additional context before generating the final content. This gives you full control over what goes into the final output.",
  },
  {
    question: "Will V2Post support TikTok and Twitch in the future?",
    answer:
      "Yes! V2Post's architecture is built to support multiple video platforms. TikTok and Twitch integration is on our roadmap. Stay tuned for updates as we continue to expand platform support.",
  },
  {
    question: "Is V2Post content unique and plagiarism-free?",
    answer:
      "Yes, V2Post generates 100% unique content using GPT-4.1. Each piece is original and based on your specific video content. The AI rephrases and restructures the transcript rather than copying it, ensuring the output passes plagiarism checks.",
  },
  {
    question: "How long does it take to generate content?",
    answer:
      "Most content is generated in under 30 seconds, depending on the length of the source video and the selected output format. Longer videos with more transcript content may take slightly longer, but the process is fully automated — just sit back and let V2Post do the work.",
  },
];

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FaqItem({ question, answer, isOpen, onToggle, index }: FaqItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`border rounded-xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-white/8 bg-white/3 hover:border-white/15"
      }`}
    >
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
            isOpen ? "text-emerald-300" : "text-white"
          }`}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-base font-bold transition-colors duration-200 ${
            isOpen
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-white/10 text-slate-400"
          }`}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="py-24 px-4 relative">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Frequently Asked{" "}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Everything you need to know about V2Post. Can&apos;t find the answer you&apos;re looking for?{" "}
            <a href="mailto:support@v2post.io" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Reach out to us
            </a>
            .
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              index={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
