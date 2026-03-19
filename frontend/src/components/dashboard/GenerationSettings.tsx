"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "@/components/ui/Select";

export interface GenerationSettingsValue {
  contentType: string;
  keywords: string[];
  toneOfVoice: string;
  targetMinChars?: number;
  targetMaxChars?: number;
  includeSourceLink: boolean;
  videoUrl: string;
}

interface GenerationSettingsProps {
  onSettingsChange: (settings: GenerationSettingsValue) => void;
  videoUrl?: string;
}

const contentTypeOptions = [
  { value: "seo_article", label: "📄 SEO Article" },
  { value: "linkedin_post", label: "💼 LinkedIn Post" },
  { value: "twitter_thread", label: "🐦 Twitter Thread" },
  { value: "video_recap", label: "🎬 Video Recap" },
];

const toneOptionsByType: Record<string, { value: string; label: string }[]> = {
  seo_article: [
    { value: "professional_expert", label: "🧑‍💼 Professional / Expert" },
    { value: "conversational_friendly", label: "💬 Conversational / Friendly" },
    { value: "provocative_bold", label: "🔥 Provocative / Bold" },
    { value: "educational_instructional", label: "📚 Educational / Instructional" },
    { value: "storyteller", label: "📖 Storyteller" },
  ],
  linkedin_post: [
    { value: "expert_insight", label: "🔍 Expert Insight" },
    { value: "personal_story", label: "📖 Personal Story" },
    { value: "actionable_advice", label: "✅ Actionable Advice" },
  ],
  twitter_thread: [
    { value: "punchy_bold", label: "⚡ Punchy & Bold" },
    { value: "controversial", label: "🔥 Controversial" },
    { value: "data_driven", label: "📊 Data-Driven" },
  ],
  video_recap: [
    { value: "concise_summary", label: "⚡ Concise Summary" },
    { value: "engaging_recap", label: "🎯 Engaging Recap" },
    { value: "educational_review", label: "📚 Educational Review" },
  ],
};

const defaultToneByType: Record<string, string> = {
  seo_article: "professional_expert",
  linkedin_post: "expert_insight",
  twitter_thread: "punchy_bold",
  video_recap: "concise_summary",
};

const seoLengthOptions = [
  {
    value: "micro",
    label: "⚡ Micro-Post (1,500–2,500 chars)",
    min: 1500,
    max: 2500,
    description: "Quick notes, Facebook posts, short news — ideal for Shorts",
  },
  {
    value: "optimal",
    label: "🎯 Optimal SEO Article (3,000–5,000 chars)",
    min: 3000,
    max: 5000,
    description: "Best for corporate blogs — deep coverage with strong keyword placement",
  },
  {
    value: "longread",
    label: "📖 Standard Longread (5,000–8,000 chars)",
    min: 5000,
    max: 8000,
    description: "Tutorials, service reviews, expert columns — wide Google ranking",
  },
  {
    value: "deepdive",
    label: "🔬 Deep Dive Analysis (10,000–20,000 chars)",
    min: 10000,
    max: 20000,
    description: "Interviews, webinars, podcasts — complex H2–H4 hierarchy required",
  },
];

export default function GenerationSettings({ onSettingsChange, videoUrl: videoUrlProp }: GenerationSettingsProps) {
  const [contentType, setContentType] = useState("seo_article");
  const [toneOfVoice, setToneOfVoice] = useState("professional_expert");
  const [seoLength, setSeoLength] = useState("optimal");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [includeSourceLink, setIncludeSourceLink] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const currentLength = seoLengthOptions.find((o) => o.value === seoLength);

  const notify = (overrides: Partial<GenerationSettingsValue> = {}) => {
    const len = seoLengthOptions.find((o) => o.value === seoLength);
    const ct = overrides.contentType ?? contentType;
    const usesLength = ct === "seo_article";
    onSettingsChange({
      contentType,
      keywords,
      toneOfVoice,
      targetMinChars: usesLength ? len?.min : undefined,
      targetMaxChars: usesLength ? len?.max : undefined,
      includeSourceLink,
      videoUrl,
      ...overrides,
    });
  };

  // Emit initial settings on mount
  useEffect(() => {
    notify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addKeyword = (value: string) => {
    const trimmed = value.trim().replace(/,+\s*$/, "");
    if (trimmed && !keywords.includes(trimmed)) {
      const next = [...keywords, trimmed];
      setKeywords(next);
      notify({ keywords: next });
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    const next = keywords.filter((k) => k !== kw);
    setKeywords(next);
    notify({ keywords: next });
  };

  const handleContentTypeChange = (val: string) => {
    setContentType(val);
    const defaultTone = defaultToneByType[val] ?? "professional_expert";
    setToneOfVoice(defaultTone);
    const usesLength = val === "seo_article";
    const len = seoLengthOptions.find((o) => o.value === seoLength);
    onSettingsChange({
      contentType: val,
      keywords,
      toneOfVoice: defaultTone,
      targetMinChars: usesLength ? len?.min : undefined,
      targetMaxChars: usesLength ? len?.max : undefined,
      includeSourceLink,
      videoUrl,
    });
  };

  const handleToneChange = (val: string) => {
    setToneOfVoice(val);
    notify({ toneOfVoice: val });
  };

  const handleSeoLengthChange = (val: string) => {
    setSeoLength(val);
    const usesLength = contentType === "seo_article";
    const len = seoLengthOptions.find((o) => o.value === val);
    onSettingsChange({
      contentType,
      keywords,
      toneOfVoice,
      targetMinChars: usesLength ? len?.min : undefined,
      targetMaxChars: usesLength ? len?.max : undefined,
      includeSourceLink,
      videoUrl,
    });
  };

  const handleIncludeSourceLinkChange = (checked: boolean) => {
    setIncludeSourceLink(checked);
    // Auto-fill video URL from the prop when enabling the option
    if (checked && videoUrlProp && !videoUrl) {
      setVideoUrl(videoUrlProp);
      notify({ includeSourceLink: checked, videoUrl: videoUrlProp });
    } else {
      notify({ includeSourceLink: checked });
    }
  };

  const handleVideoUrlChange = (val: string) => {
    setVideoUrl(val);
    notify({ videoUrl: val });
  };

  const toneOptions = toneOptionsByType[contentType] ?? toneOptionsByType.seo_article;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <Select
        label="Content Type"
        options={contentTypeOptions}
        value={contentType}
        onChange={handleContentTypeChange}
      />

      {/* Content length dropdown — shown only for seo_article */}
      <AnimatePresence>
        {contentType === "seo_article" && (
          <motion.div
            key="content-length"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="space-y-2">
              <Select
                label="Content Length"
                options={seoLengthOptions.map((o) => ({ value: o.value, label: o.label }))}
                value={seoLength}
                onChange={handleSeoLengthChange}
              />
              {currentLength && (
                <p className="text-xs text-slate-500 pl-1">{currentLength.description}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tone of Voice — options change per content type */}
      <Select
        label="Tone of Voice"
        options={toneOptions}
        value={toneOfVoice}
        onChange={handleToneChange}
      />

      {/* Include Source Link — shown for all content types */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center mt-0.5">
            <input
              id="include-source-link"
              type="checkbox"
              checked={includeSourceLink}
              onChange={(e) => handleIncludeSourceLinkChange(e.target.checked)}
              aria-describedby="include-source-link-desc"
              className="w-4 h-4 rounded border border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30 focus:ring-2 cursor-pointer accent-emerald-500"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="include-source-link"
              className="text-sm font-medium text-slate-300 cursor-pointer flex items-center gap-1.5"
            >
              Include Source Link
              <span
                title="Automatically adds a call-to-action and the original video link at the end of your post or thread to boost your YouTube views."
                aria-hidden="true"
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] cursor-help select-none"
              >
                ?
              </span>
            </label>
            <p id="include-source-link-desc" className="text-xs text-slate-500 mt-0.5">
              Adds a CTA + video link at the end to boost YouTube views.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {includeSourceLink && (
            <motion.div
              key="video-url"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {videoUrlProp ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm text-slate-300 truncate">{videoUrlProp}</span>
                </div>
              ) : (
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 py-2.5 px-4 text-sm"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keywords — hidden for Video Recap */}
      <AnimatePresence>
        {contentType !== "video_recap" && (
        <motion.div
          key="keywords"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Keywords <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addKeyword(keywordInput);
            }
          }}
          onBlur={() => keywordInput.trim() && addKeyword(keywordInput)}
          placeholder="Type keyword and press Enter..."
          className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 py-2.5 px-4 text-sm"
        />

        <AnimatePresence>
          {keywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {keywords.map((kw) => (
                <motion.span
                  key={kw}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-medium"
                >
                  {kw}
                  <button
                    onClick={() => removeKeyword(kw)}
                    className="text-emerald-400 hover:text-white transition-colors leading-none"
                    aria-label={`Remove ${kw}`}
                  >
                    ✕
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-slate-600 text-xs">
          Keywords will be naturally integrated into the generated content.
        </p>
      </div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
