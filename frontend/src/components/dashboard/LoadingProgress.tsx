"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FUN_FACTS = [
  { icon: "📊", text: "YouTube has over 2.7 billion monthly active users worldwide." },
  { icon: "⏱️", text: "The average YouTube video that ranks on page 1 of Google is 14 minutes long." },
  { icon: "📱", text: "TikTok users spend an average of 95 minutes per day on the app." },
  { icon: "🤖", text: "AI-generated content can reduce content creation time by up to 80%." },
  { icon: "🎥", text: "Over 500 hours of video are uploaded to YouTube every minute." },
  { icon: "💼", text: "LinkedIn posts with images get 2x more engagement than text-only posts." },
  { icon: "🎮", text: "Twitch streamers broadcast over 2 million hours of content daily." },
  { icon: "🚀", text: "Repurposing one video into blog posts can increase organic traffic by 300%." },
  { icon: "🌍", text: "GPT-4 can understand and process content in over 50 languages." },
  { icon: "📈", text: "SEO-optimized articles from video content rank 40% faster than written-from-scratch content." },
  { icon: "📲", text: "The average TikTok video gets 3x more shares than Instagram Reels." },
  { icon: "✨", text: "AI tools help creators produce 5x more content with the same effort." },
  { icon: "🔥", text: "YouTube Shorts now receive over 70 billion daily views." },
  { icon: "📝", text: "A single 10-minute YouTube video can generate 5+ SEO articles." },
  { icon: "📣", text: "Content creators who repurpose videos see 60% higher audience growth." },
  { icon: "🎙️", text: "Twitch had over 7.5 million unique streamers in the last month." },
  { icon: "🏆", text: "Blog posts with video content are 53x more likely to rank on Google's first page." },
  { icon: "🧠", text: "AI writing assistants are used by 35% of content marketers." },
  { icon: "🔍", text: "YouTube is the second largest search engine in the world." },
  { icon: "⚡", text: "TikTok's algorithm can make a video go viral within 15 minutes of posting." },
  { icon: "📰", text: "SEO articles between 1,500–2,500 words perform best in search rankings." },
  { icon: "🎯", text: "Videos with captions get 40% more views than those without." },
  { icon: "📅", text: "LinkedIn articles get 45% more engagement when published on Tuesday mornings." },
  { icon: "💰", text: "The global AI content creation market will reach $15 billion by 2027." },
  { icon: "👁️", text: "Twitch viewers watch an average of 95 minutes per session." },
  { icon: "📊", text: "AI-powered SEO tools can improve click-through rates by 25%." },
  { icon: "📆", text: "YouTube creators who post consistently grow their audience 3x faster." },
  { icon: "🛍️", text: "Over 70% of TikTok users discover new products through the platform." },
  { icon: "🔬", text: "Natural Language Processing (NLP) accuracy has improved 20% in the last 2 years." },
  { icon: "⌚", text: "Long-form YouTube videos (15+ min) have higher average watch time than short videos." },
  { icon: "💡", text: "AI can summarize a 1-hour video into a 500-word article in under 30 seconds." },
  { icon: "🐦", text: "Twitter/X threads with 5+ tweets get 3x more impressions than single tweets." },
  { icon: "🖼️", text: "Over 90% of top-performing blog posts include visual content from videos." },
  { icon: "💵", text: "Twitch Partners can earn between $3–5 per subscriber per month." },
  { icon: "🌐", text: "AI translation can help creators reach 4 billion additional potential viewers." },
  { icon: "🤳", text: "YouTube's recommendation algorithm drives 70% of all views on the platform." },
  { icon: "💸", text: "Content repurposing can reduce production costs by up to 60%." },
  { icon: "❤️", text: "TikTok creators with 10K+ followers have an average engagement rate of 6%." },
  { icon: "📝", text: "The average blog post takes 4 hours to write — AI reduces this to 15 minutes." },
  { icon: "🖱️", text: "YouTube videos with custom thumbnails get 30% more clicks." },
  { icon: "💬", text: "Twitch's Just Chatting category has become the most-watched category on the platform." },
  { icon: "🔗", text: "AI-written meta descriptions can improve search CTR by 18%." },
  { icon: "🔎", text: "Over 40% of Gen Z uses TikTok as their primary search engine." },
  { icon: "📡", text: "Multi-format content strategies increase total reach by 250%." },
  { icon: "🎬", text: "YouTube Premieres generate 8x more chat activity than regular uploads." },
  { icon: "🕐", text: "AI can detect the optimal posting time for each social platform with 90% accuracy." },
  { icon: "🌟", text: "Creators who repurpose content across 3+ platforms see 400% more total engagement." },
  { icon: "🔮", text: "By 2026, 90% of online content will be AI-assisted or AI-generated." },
];

interface LoadingProgressProps {
  message?: string;
  warningMessage?: string;
}

export default function LoadingProgress({
  message = "Processing...",
  warningMessage = "Don't close this tab! Your progress won't be saved and tokens may be lost.",
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
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

  // Rotate facts every 5 seconds
  useEffect(() => {
    factIntervalRef.current = setInterval(() => {
      setFactIndex((i) => (i + 1) % FUN_FACTS.length);
    }, 5000);
    return () => {
      if (factIntervalRef.current) clearInterval(factIntervalRef.current);
    };
  }, []);

  const currentFact = FUN_FACTS[factIndex];

  return (
    <div className="space-y-4 mt-4">
      {/* Progress bar + warning combined card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-slate-300 flex items-center gap-2">
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
            className="h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              background: "linear-gradient(90deg, #10B981, #059669, #34D399)",
            }}
          />
        </div>

        {/* Warning inline */}
        <div className="mt-3 flex items-start gap-2 text-xs text-yellow-300/70">
          <span className="text-yellow-400 mt-0.5 shrink-0">⚠️</span>
          <p>{warningMessage}</p>
        </div>
      </div>

      {/* Animated fact card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={factIndex}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{currentFact.icon}</span>
            <div className="flex-1">
              <p className="text-xs text-emerald-400 font-semibold mb-1">Did you know?</p>
              <p className="text-sm text-slate-300 leading-relaxed">{currentFact.text}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
