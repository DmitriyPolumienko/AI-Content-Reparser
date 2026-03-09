"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SkeletonLoader from "./SkeletonLoader";
import { generateContent } from "@/lib/api";

const CONTENT_TYPE_OPTIONS = [
  { label: "SEO Article", value: "seo_article" },
  { label: "LinkedIn Post", value: "linkedin_post" },
  { label: "Twitter Thread", value: "twitter_thread" },
];

interface GenerationSettingsProps {
  transcript: string;
  onResult: (content: string, wordsUsed: number, wordsRemaining: number) => void;
  onBack: () => void;
}

export default function GenerationSettings({
  transcript,
  onResult,
  onBack,
}: GenerationSettingsProps) {
  const [contentType, setContentType] = useState("seo_article");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const data = await generateContent({
        transcript,
        content_type: contentType,
        keywords,
      });

      onResult(data.content, data.words_used, data.words_remaining);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Step 3: Generation Settings</h2>
        <p className="text-slate-400 text-sm">
          Choose the output format and add any keywords you want included.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Content Type"
          options={CONTENT_TYPE_OPTIONS}
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          disabled={loading}
        />
        <Input
          label="Required Keywords (comma-separated)"
          placeholder="e.g. AI, content marketing, SEO"
          value={keywordsInput}
          onChange={(e) => setKeywordsInput(e.target.value)}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-4">Generating your content with GPT-4.1…</p>
          <SkeletonLoader />
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>
          ← Back
        </Button>
        <Button onClick={handleGenerate} loading={loading} disabled={loading}>
          Generate Content
        </Button>
      </div>
    </div>
  );
}
