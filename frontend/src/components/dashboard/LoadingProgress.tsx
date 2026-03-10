"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FUN_FACTS = [
  "YouTube has over 2.7 billion monthly active users worldwide.",
  "The average YouTube video that ranks on page 1 of Google is 14 minutes long.",
  "TikTok users spend an average of 95 minutes per day on the app.",
  "AI-generated content can reduce content creation time by up to 80%.",
  "Over 500 hours of video are uploaded to YouTube every minute.",
  "LinkedIn posts with images get 2x more engagement than text-only posts.",
  "Twitch streamers broadcast over 2 million hours of content daily.",
  "Repurposing one video into blog posts can increase organic traffic by 300%.",
  "GPT-4 can understand and process content in over 50 languages.",
  "SEO-optimized articles from video content rank 40% faster than written-from-scratch content.",
  "The average TikTok video gets 3x more shares than Instagram Reels.",
  "AI tools help creators produce 5x more content with the same effort.",
  "YouTube Shorts now receive over 70 billion daily views.",
  "A single 10-minute YouTube video can generate 5+ SEO articles.",
  "Content creators who repurpose videos see 60% higher audience growth.",
  "Twitch had over 7.5 million unique streamers in the last month.",
  "Blog posts with video content are 53x more likely to rank on Google's first page.",
  "AI writing assistants are used by 35% of content marketers.",
  "YouTube is the second largest search engine in the world.",
  "TikTok's algorithm can make a video go viral within 15 minutes of posting.",
  "SEO articles between 1,500–2,500 words perform best in search rankings.",
  "AI can analyze video sentiment with 94% accuracy.",
  "LinkedIn articles get 45% more engagement when published on Tuesday mornings.",
  "The global AI content creation market will reach $15 billion by 2027.",
  "Videos with captions get 40% more views than those without.",
  "Twitch viewers watch an average of 95 minutes per session.",
  "AI-powered SEO tools can improve click-through rates by 25%.",
  "YouTube creators who post consistently grow their audience 3x faster.",
  "Over 70% of TikTok users discover new products through the platform.",
  "Natural Language Processing (NLP) accuracy has improved 20% in the last 2 years.",
  "Long-form YouTube videos (15+ min) have higher average watch time than short videos.",
  "AI can summarize a 1-hour video into a 500-word article in under 30 seconds.",
  "Twitter/X threads with 5+ tweets get 3x more impressions than single tweets.",
  "Over 90% of top-performing blog posts include visual content from videos.",
  "Twitch Partners can earn between $3–5 per subscriber per month.",
  "AI translation can help creators reach 4 billion additional potential viewers.",
  "YouTube's recommendation algorithm drives 70% of all views on the platform.",
  "Content repurposing can reduce production costs by up to 60%.",
  "TikTok creators with 10K+ followers have an average engagement rate of 6%.",
  "GPT models can generate content that passes AI detection 85% of the time with proper prompting.",
  "The average blog post takes 4 hours to write — AI reduces this to 15 minutes.",
  "YouTube videos with custom thumbnails get 30% more clicks.",
  "Twitch's Just Chatting category has become the most-watched category on the platform.",
  "AI-written meta descriptions can improve search CTR by 18%.",
  "Over 40% of Gen Z uses TikTok as their primary search engine.",
  "Multi-format content strategies increase total reach by 250%.",
  "YouTube Premieres generate 8x more chat activity than regular uploads.",
  "AI can detect the optimal posting time for each social platform with 90% accuracy.",
  "Creators who repurpose content across 3+ platforms see 400% more total engagement.",
  "By 2026, 90% of online content will be AI-assisted or AI-generated.",
];

interface LoadingProgressProps {
  message?: string;
  warningMessage?: string;
}

export default function LoadingProgress({
  message = "Processing...",
  warningMessage = "⚠️ Don't close this tab! Your progress won't be saved and tokens may be lost.",
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
  const [factVisible, setFactVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const factIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slowly fill progress from 0% to ~90%
  useEffect(() => {
    setProgress(0);
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 2.5 + 0.5;
      if (current >= 90) {
        current = 90;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setProgress(Math.round(current));
    }, 400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Rotate fun facts every 4.5 seconds with fade
  useEffect(() => {
    factIntervalRef.current = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex((i) => (i + 1) % FUN_FACTS.length);
        setFactVisible(true);
      }, 400);
    }, 4500);
    return () => {
      if (factIntervalRef.current) clearInterval(factIntervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-5 mt-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {message}
          </span>
          <span className="text-xs text-emerald-400 font-semibold tabular-nums">{progress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg, #10B981, #059669, #34D399)" }}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                animation: "shimmer 1.5s infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Warning box */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
        <span className="text-yellow-400 text-base mt-0.5 shrink-0">⚠️</span>
        <p className="text-yellow-300/80 text-xs leading-relaxed">{warningMessage}</p>
      </div>

      {/* Fun fact */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
        <span className="text-base shrink-0">💡</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-400 font-semibold mb-1">Did you know?</p>
          <AnimatePresence mode="wait">
            {factVisible && (
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-xs text-slate-400 leading-relaxed"
              >
                {FUN_FACTS[factIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
