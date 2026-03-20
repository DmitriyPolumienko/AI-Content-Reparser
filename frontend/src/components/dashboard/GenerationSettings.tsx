"use client";

import React, { useState, useEffect } from "react";
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
  language: string;
}

interface GenerationSettingsProps {
  onSettingsChange: (settings: GenerationSettingsValue) => void;
  videoUrl?: string;
  transcriptCharCount?: number;
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

/** Shared style for flag-icons span elements in the Language dropdown. */
const FLAG_STYLE: React.CSSProperties = { width: "1.25rem", height: "0.9375rem", display: "inline-block" };

/** Helper to render a flag-icons span for the Language dropdown (null = no flag, e.g. Russian). */
function langFlag(code: string, label: string) {
  return <span className={`fi fi-${code}`} style={FLAG_STYLE} role="img" aria-label={label} />;
}

const languageOptions = [
  { value: "English",    label: "English",    icon: langFlag("gb", "English") },
  { value: "Chinese",    label: "Chinese",    icon: langFlag("cn", "Chinese") },
  { value: "Spanish",    label: "Spanish",    icon: langFlag("es", "Spanish") },
  { value: "German",     label: "German",     icon: langFlag("de", "German") },
  { value: "Russian",    label: "Russian" },
  { value: "French",     label: "French",     icon: langFlag("fr", "French") },
  { value: "Portuguese", label: "Portuguese", icon: langFlag("pt", "Portuguese") },
  { value: "Arabic",     label: "Arabic",     icon: langFlag("sa", "Arabic") },
  { value: "Ukrainian",  label: "Ukrainian",  icon: langFlag("ua", "Ukrainian") },
  { value: "Polish",     label: "Polish",     icon: langFlag("pl", "Polish") },
  { value: "Italian",    label: "Italian",    icon: langFlag("it", "Italian") },
];

const LENGTH_EXCEEDED_TOOLTIP =
  "Not recommended because the input is shorter than the selected article size. Context may become diluted or lost.";

export default function GenerationSettings({ onSettingsChange, videoUrl: videoUrlProp, transcriptCharCount }: GenerationSettingsProps) {
  const [contentType, setContentType] = useState("seo_article");
  const [toneOfVoice, setToneOfVoice] = useState("professional_expert");
  const [seoLength, setSeoLength] = useState("optimal");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [includeSourceLink, setIncludeSourceLink] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [language, setLanguage] = useState("English");

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
      language,
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
      language,
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
      language,
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

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    notify({ language: val });
  };

  const toneOptions = toneOptionsByType[contentType] ?? toneOptionsByType.seo_article;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* 2x2 Content Type Grid */}
      <div>
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          Content Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          {contentTypeOptions.map((opt) => {
            const isActive = contentType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleContentTypeChange(opt.value)}
                className="flex flex-col items-start gap-1 p-3 text-left transition-all duration-300"
                style={{
                  background: isActive ? "rgba(157,80,255,0.1)" : "rgba(18,20,28,0.5)",
                  border: isActive ? "2px solid #9D50FF" : "1px solid rgba(157,80,255,0.12)",
                  borderRadius: 8,
                  boxShadow: isActive ? "0 0 20px rgba(157,80,255,0.12), inset 0 0 12px rgba(157,80,255,0.04)" : "none",
                  transform: isActive ? "scale(1.01)" : "scale(1)",
                }}
              >
                <span className="text-lg">{opt.label.split(" ")[0]}</span>
                <span
                  className="text-sm font-medium"
                  style={{ color: isActive ? "#9D50FF" : "rgba(255,255,255,0.7)" }}
                >
                  {opt.label.substring(opt.label.indexOf(" ") + 1)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language dropdown — output language for generation */}
      <Select
        label="Language"
        options={languageOptions}
        value={language}
        onChange={handleLanguageChange}
      />

      {/* Content length — shown only for seo_article, segmented control */}
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
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                Content Length
              </label>
              <div className="space-y-1.5">
                {seoLengthOptions.map((opt) => {
                  const isActive = seoLength === opt.value;
                  const exceedsInput =
                    transcriptCharCount !== undefined && transcriptCharCount > 0 && opt.min > transcriptCharCount;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSeoLengthChange(opt.value)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-all duration-300"
                      style={{
                        background: isActive ? "rgba(157,80,255,0.1)" : "rgba(18,20,28,0.4)",
                        border: isActive ? "1px solid rgba(157,80,255,0.5)" : "1px solid rgba(157,80,255,0.1)",
                        borderRadius: 8,
                        color: isActive ? "#9D50FF" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <span>{opt.label}</span>
                      {exceedsInput && (
                        <span
                          title={LENGTH_EXCEEDED_TOOLTIP}
                          className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] cursor-help select-none"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                          aria-label={LENGTH_EXCEEDED_TOOLTIP}
                        >
                          i
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {currentLength && (
                <p className="text-xs pl-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {currentLength.description}
                </p>
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
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: "#9D50FF" }}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="include-source-link"
              className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Include Source Link
              <span
                title="Automatically adds a call-to-action and the original video link at the end of your post or thread to boost your YouTube views."
                aria-hidden="true"
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] cursor-help select-none"
                style={{ background: "rgba(157,80,255,0.15)", color: "rgba(157,80,255,0.8)" }}
              >
                ?
              </span>
            </label>
            <p id="include-source-link-desc" className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
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
                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9D50FF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{videoUrlProp}</span>
                </div>
              ) : (
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full text-white focus:outline-none transition-all duration-300 py-2.5 px-4 text-sm"
                  style={{
                    background: "rgba(18,20,28,0.5)",
                    border: "1px solid rgba(157,80,255,0.15)",
                    borderRadius: 8,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(157,80,255,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(157,80,255,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(157,80,255,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
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
        <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
          Keywords <span className="font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
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
          onBlur={() => {
            if (keywordInput.trim()) addKeyword(keywordInput);
          }}
          placeholder="Type keyword and press Enter..."
          className="w-full text-white focus:outline-none transition-all duration-300 py-2.5 px-4 text-sm"
          style={{
            background: "rgba(18,20,28,0.5)",
            border: "1px solid rgba(157,80,255,0.12)",
            borderRadius: 8,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(157,80,255,0.5)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(157,80,255,0.1)";
          }}
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
                  className="oracle-chip inline-flex items-center gap-1.5"
                >
                  {kw}
                  <button
                    onClick={() => removeKeyword(kw)}
                    className="leading-none transition-colors"
                    style={{ color: "rgba(157,80,255,0.7)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(157,80,255,0.7)")}
                    aria-label={`Remove ${kw}`}
                  >
                    ✕
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          Keywords will be naturally integrated into the generated content.
        </p>
      </div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

