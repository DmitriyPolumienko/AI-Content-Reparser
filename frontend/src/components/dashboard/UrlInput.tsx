"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SkeletonLoader from "./SkeletonLoader";
import { extractTranscript } from "@/lib/api";

interface UrlInputProps {
  onTranscriptReady: (transcript: string, wordCount: number) => void;
}

const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export default function UrlInput({ onTranscriptReady }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidYouTubeUrl = (value: string) => YT_REGEX.test(value.trim());

  const handleExtract = async () => {
    setError("");
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }
    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL (e.g. https://youtube.com/watch?v=...).");
      return;
    }

    setLoading(true);
    try {
      const data = await extractTranscript(url.trim());
      onTranscriptReady(data.transcript, data.word_count);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to extract transcript.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Step 1: Enter Video URL</h2>
        <p className="text-slate-400 text-sm">
          Paste a YouTube video link and we&apos;ll extract the transcript for you.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleExtract()}
          error={error}
          className="flex-1"
          disabled={loading}
        />
        <Button
          onClick={handleExtract}
          loading={loading}
          disabled={loading}
          className="sm:self-start"
        >
          Extract Subtitles
        </Button>
      </div>

      {loading && (
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-4">Extracting transcript…</p>
          <SkeletonLoader />
        </div>
      )}
    </div>
  );
}
