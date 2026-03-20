"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UrlInput from "./UrlInput";
import SubtitleEditor from "./SubtitleEditor";
import GenerationSettings from "./GenerationSettings";
import type { GenerationSettingsValue } from "./GenerationSettings";
import StreamingDrawer from "./StreamingDrawer";
import PurchaseModal from "./PurchaseModal";
import LoadingProgress from "./LoadingProgress";
import DashboardFaq from "./DashboardFaq";
import ShimmerButton from "@/components/effects/ShimmerButton";
import ErrorState from "@/components/ui/ErrorState";
import OracleSidebar from "./OracleSidebar";
import OracleTopbar from "./OracleTopbar";
import AiAccuracyIndicator from "./AiAccuracyIndicator";
import FloatingTerminal from "./FloatingTerminal";
import { streamGenerateContent, listGenerations, getGeneration, SymbolPackage, GenerationHistoryItem } from "@/lib/api";

type Step = 1 | 2 | 3 | 4;

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function Dashboard() {
  const [step, setStep] = useState<Step>(1);
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [settings, setSettings] = useState<GenerationSettingsValue>({
    contentType: "seo_article",
    keywords: [],
    toneOfVoice: "professional_expert",
    includeSourceLink: false,
    videoUrl: "",
    language: "English",
  });
  const [generatedContent, setGeneratedContent] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(18000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<502 | 504 | null>(null);
  const [videosProcessed, setVideosProcessed] = useState(247);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Streaming drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamedContentRef = useRef("");
  const [streamedContent, setStreamedContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Purchase modal state
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [overLimitPackages, setOverLimitPackages] = useState<SymbolPackage[]>([]);
  const [overLimitBillingNote, setOverLimitBillingNote] = useState<string | undefined>();

  // Generation history
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // TODO: replace with real user authentication once auth is implemented
  const MOCK_USER_ID = "mock-user-123";
  // Delay after stream end to allow backend to finish saving the generation
  const HISTORY_REFRESH_DELAY_MS = 1500;

  // Floating terminal state
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Fetch the current generation counter from the backend on mount
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    fetch(`${apiUrl}/api/stats`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.videos_processed !== undefined) {
          setVideosProcessed(data.videos_processed);
        }
      })
      .catch(() => {
        // Non-critical; keep the local default value
      });
  }, []);

  // Fetch history on mount
  useEffect(() => {
    setHistoryLoading(true);
    listGenerations(MOCK_USER_ID).then((items) => {
      setHistory(items);
      setHistoryLoading(false);
    });
  }, []);

  const refreshHistory = () => {
    listGenerations(MOCK_USER_ID).then(setHistory);
  };

  const handleExtract = (extractedUrl: string, extractedTranscript: string, language?: string) => {
    setUrl(extractedUrl);
    setTranscript(extractedTranscript);
    if (language) setSelectedLanguage(language);
    setStep(2);
  };

  const handleGenerate = async () => {
    // Abort any in-flight stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError("");
    setErrorCode(null);
    streamedContentRef.current = "";
    setStreamedContent("");
    setDrawerOpen(true);
    setIsStreaming(true);
    setTerminalOpen(true);

    const controller = streamGenerateContent(
      {
        transcript,
        content_type: settings.contentType,
        keywords: settings.keywords,
        language: settings.language || undefined,
        tone_of_voice: settings.toneOfVoice,
        target_min_chars: settings.targetMinChars,
        target_max_chars: settings.targetMaxChars,
        include_source_link: settings.includeSourceLink,
        video_url: settings.includeSourceLink ? settings.videoUrl || null : null,
      },
      (event) => {
        if (event.type === "start") {
          // streaming started, skeleton visible
        } else if (event.type === "delta") {
          streamedContentRef.current += event.text;
          setStreamedContent(streamedContentRef.current);
        } else if (event.type === "end") {
          setIsStreaming(false);
          setLoading(false);
          setGeneratedContent(streamedContentRef.current);
          setCharsRemaining(event.chars_remaining);
          setVideosProcessed(event.videos_processed);
          setStep(4);
          // Refresh history after a short delay to let the backend save
          setTimeout(() => refreshHistory(), HISTORY_REFRESH_DELAY_MS);
        } else if (event.type === "error") {
          setIsStreaming(false);
          setLoading(false);
          if (event.code === "over_limit" && event.packages) {
            setOverLimitPackages(event.packages);
            setOverLimitBillingNote(event.billing_note);
            setPurchaseModalOpen(true);
            setDrawerOpen(false);
          } else {
            setError(event.message ?? "Something went wrong. Please try again.");
            setDrawerOpen(false);
          }
        }
      }
    );

    abortControllerRef.current = controller;
  };

  const handleStartOver = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStep(1);
    setUrl("");
    setTranscript("");
    setSettings({ contentType: "seo_article", keywords: [], toneOfVoice: "professional_expert", includeSourceLink: false, videoUrl: "", language: "English" });
    setGeneratedContent("");
    setStreamedContent("");
    setError("");
    setErrorCode(null);
    setDrawerOpen(false);
    setIsStreaming(false);
    setPurchaseModalOpen(false);
    setTerminalOpen(false);
  };

  const handlePurchase = (pkg: SymbolPackage) => {
    // Mock: add symbols to balance display
    setCharsRemaining((prev) => prev + pkg.symbols);
  };

  const handleHistoryItemClick = async (item: GenerationHistoryItem) => {
    if (item.content) {
      // Full content already available (shouldn't happen from list, but handle it)
      setStreamedContent(item.content);
      setGeneratedContent(item.content);
      setIsStreaming(false);
      setDrawerOpen(true);
      return;
    }
    // Fetch full generation from API
    const full = await getGeneration(item.id);
    if (full?.content) {
      setStreamedContent(full.content);
      setGeneratedContent(full.content);
      setIsStreaming(false);
      setDrawerOpen(true);
    }
  };

  // Allow navigating backward via sidebar step clicks (but not forward past current)
  const handleSidebarStepClick = (s: Step) => {
    if (s <= step) setStep(s);
  };

  const stepTitles: Record<Step, string> = {
    1: "Enter YouTube URL",
    2: "Edit Transcript",
    3: "Configure Output",
    4: "Generated Content",
  };

  const stepDescriptions: Record<Step, string> = {
    1: "Paste a YouTube link to extract the transcript automatically.",
    2: "Review and edit the extracted transcript before generating content.",
    3: "Choose your content format, tone, language, and length.",
    4: "Your AI-generated content is ready. Export or refine it.",
  };

  // Bottom padding when floating terminal is visible
  const TERMINAL_HEIGHT = 200;
  const bottomPadding = isStreaming || terminalOpen ? TERMINAL_HEIGHT : 0;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#08090A", fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Fixed sidebar ───────────────────────────────── */}
      <OracleSidebar
        step={step}
        onStepClick={handleSidebarStepClick}
        onStartOver={handleStartOver}
      />

      {/* ── Fixed topbar ────────────────────────────────── */}
      <OracleTopbar charsRemaining={charsRemaining} onStartOver={handleStartOver} />

      {/* ── Main content area ───────────────────────────── */}
      <div
        className="flex items-start"
        style={{
          marginLeft: 260,
          paddingTop: 72,
          minHeight: "100vh",
          paddingBottom: bottomPadding,
        }}
      >
        {/* Central panel */}
        <main
          className="flex-1 min-w-0 overflow-x-hidden"
          style={{ padding: "32px 32px 24px" }}
        >
          {/* ── Stats cards (step 1 hero area) ─────────── */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-4 mb-8 max-w-2xl"
            >
              {/* Videos processed */}
              <div
                className="oracle-glass p-4 animate-oracle-breathe"
                style={{ boxShadow: "0 0 30px rgba(157,80,255,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(157,80,255,0.12)" }}
                  >
                    <svg className="w-4 h-4" style={{ color: "#9D50FF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <motion.p
                      key={videosProcessed}
                      initial={{ scale: 1.15, color: "#9D50FF" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-xl font-bold font-display"
                    >
                      {videosProcessed.toLocaleString()}
                    </motion.p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Videos Processed</p>
                  </div>
                </div>
              </div>

              {/* Avg time */}
              <div className="oracle-glass p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(157,80,255,0.08)" }}
                  >
                    <svg className="w-4 h-4" style={{ color: "rgba(157,80,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-display text-white">~30s</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Avg Process Time</p>
                  </div>
                </div>
              </div>

              {/* Success rate */}
              <div className="oracle-glass p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(183,138,255,0.1)" }}
                  >
                    <svg className="w-4 h-4" style={{ color: "#B78AFF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-display text-white">98.5%</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Success Rate</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step header ─────────────────────────────── */}
          <div className="flex items-start justify-between mb-6 max-w-2xl">
            <div>
              <h2
                className="font-display font-bold text-2xl text-white mb-1 tracking-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                {stepTitles[step]}
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {stepDescriptions[step]}
              </p>
            </div>
            {/* AI Accuracy indicator */}
            <AiAccuracyIndicator step={step} total={4} size={56} />
          </div>

          {/* ── Step progress bar ───────────────────────── */}
          <div className="max-w-2xl mb-8">
            <div
              className="h-[3px] rounded-full overflow-hidden mb-3"
              style={{ background: "rgba(157,80,255,0.12)" }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: "linear-gradient(90deg, #9D50FF, #BD00FF)" }}
              />
            </div>
            <div className="flex items-center gap-2">
              {([1, 2, 3, 4] as Step[]).map((s, i) => {
                const labels = ["URL", "Transcript", "Configure", "Result"];
                const isActive = s === step;
                const isDone = s < step;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <button
                      onClick={() => s <= step && setStep(s)}
                      disabled={s > step}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-all duration-300"
                      style={{
                        background: isActive
                          ? "rgba(157,80,255,0.15)"
                          : isDone
                          ? "rgba(157,80,255,0.08)"
                          : "rgba(255,255,255,0.04)",
                        border: isActive
                          ? "1px solid rgba(157,80,255,0.4)"
                          : isDone
                          ? "1px solid rgba(157,80,255,0.2)"
                          : "1px solid rgba(255,255,255,0.06)",
                        color: isActive
                          ? "#9D50FF"
                          : isDone
                          ? "rgba(157,80,255,0.7)"
                          : "rgba(255,255,255,0.3)",
                        cursor: s > step ? "default" : "pointer",
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: isActive ? "#9D50FF" : isDone ? "rgba(157,80,255,0.3)" : "rgba(255,255,255,0.08)",
                          color: isActive || isDone ? "#fff" : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {isDone ? "✓" : s}
                      </span>
                      <span className="hidden sm:block">{labels[i]}</span>
                    </button>
                    {i < 3 && (
                      <div
                        className="h-px w-4 transition-all duration-500"
                        style={{
                          background: s < step ? "rgba(157,80,255,0.4)" : "rgba(255,255,255,0.06)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Step content card ───────────────────────── */}
          <div
            className="oracle-glass max-w-2xl"
            style={{ padding: "28px 28px 24px", boxShadow: "0 0 30px rgba(157,80,255,0.07)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step 1 — URL Input */}
                {step === 1 && <UrlInput onExtract={handleExtract} />}

                {/* Step 2 — Transcript editor */}
                {step === 2 && (
                  <div className="space-y-5">
                    <SubtitleEditor transcript={transcript} onChange={setTranscript} />
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setStep(1)}
                        className="text-sm transition-colors duration-300"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                      >
                        ← Back
                      </button>
                      <ShimmerButton size="md" onClick={() => setStep(3)} disabled={!transcript.trim()}>
                        Next: Configure →
                      </ShimmerButton>
                    </div>
                  </div>
                )}

                {/* Step 3 — Generation settings */}
                {step === 3 && (
                  <div className="space-y-6">
                    {errorCode ? (
                      <ErrorState
                        statusCode={errorCode}
                        onRetry={() => {
                          setErrorCode(null);
                          handleGenerate();
                        }}
                      />
                    ) : (
                      <>
                        <GenerationSettings
                          onSettingsChange={setSettings}
                          videoUrl={url}
                          transcriptCharCount={transcript.length}
                        />

                        {error && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm rounded-[8px] px-4 py-3"
                            style={{
                              color: "#ff6b6b",
                              background: "rgba(255,59,48,0.08)",
                              border: "1px solid rgba(255,59,48,0.2)",
                            }}
                          >
                            ⚠️ {error}
                          </motion.p>
                        )}

                        <div className="flex justify-between pt-2">
                          <button
                            onClick={() => setStep(2)}
                            className="text-sm transition-colors duration-300"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                          >
                            ← Back
                          </button>
                          <ShimmerButton
                            size="md"
                            onClick={handleGenerate}
                            disabled={loading}
                            className="oracle-btn-generate"
                          >
                            {loading ? "Generating..." : "⚡ Generate Content"}
                          </ShimmerButton>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 4 — Result */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="text-center py-8">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-oracle-breathe"
                        style={{
                          background: "rgba(157,80,255,0.12)",
                          border: "1px solid rgba(157,80,255,0.3)",
                        }}
                      >
                        <svg className="w-8 h-8" style={{ color: "#9D50FF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold font-display text-white mb-2">
                        Content Generated!
                      </h3>
                      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Your content is ready in the panel on the right.{" "}
                        {!drawerOpen && (
                          <button
                            onClick={() => setDrawerOpen(true)}
                            className="underline transition-colors"
                            style={{ color: "#9D50FF" }}
                          >
                            Open output panel
                          </button>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {generatedContent.length.toLocaleString()} characters generated
                      </p>
                    </div>
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setStep(3)}
                        className="text-sm transition-colors duration-300"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                      >
                        ← Back to Settings
                      </button>
                      <button
                        onClick={handleStartOver}
                        className="text-sm font-semibold transition-colors"
                        style={{ color: "#9D50FF" }}
                      >
                        + New Content
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Pro tips ────────────────────────────────── */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mt-6"
              style={{
                background: "rgba(12,13,17,0.6)",
                border: "1px solid rgba(157,80,255,0.08)",
                borderRadius: 8,
                padding: "20px 24px",
              }}
            >
              <h3
                className="text-xs font-semibold mb-4 flex items-center gap-2"
                style={{ color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                <span>💡</span> Pro Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <span style={{ color: "#9D50FF" }}>→</span>
                  <div>
                    <p className="text-sm font-medium text-white">Choose the right language</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Manual transcripts are more accurate than auto-generated ones
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span style={{ color: "#9D50FF" }}>→</span>
                  <div>
                    <p className="text-sm font-medium text-white">Videos with good audio work best</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Clear speech = better auto-generated captions
                    </p>
                  </div>
                </div>
                {step === 2 && (
                  <>
                    <div className="flex gap-3">
                      <span>✂️</span>
                      <div>
                        <p className="text-sm font-medium text-white">Trim filler words</p>
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Removing &quot;um&quot;, &quot;uh&quot; helps the AI focus on what matters
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span>📏</span>
                      <div>
                        <p className="text-sm font-medium text-white">Ideal length: 500–3,000 words</p>
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Shorter transcripts may produce thin content
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── History section ─────────────────────────── */}
          {(history.length > 0 || historyLoading) && (
            <div
              className="max-w-2xl mt-6"
              style={{
                background: "rgba(12,13,17,0.6)",
                border: "1px solid rgba(157,80,255,0.08)",
                borderRadius: 8,
                padding: "20px 24px",
              }}
            >
              <h3
                className="text-xs font-semibold mb-4 flex items-center gap-2"
                style={{ color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                <span>🕐</span> Recent Results
              </h3>
              {historyLoading ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-[8px] animate-pulse"
                      style={{ background: "rgba(157,80,255,0.05)" }}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistoryItemClick(item)}
                      className="text-left p-3 rounded-[8px] transition-all duration-300 group"
                      style={{
                        background: "rgba(157,80,255,0.04)",
                        border: "1px solid rgba(157,80,255,0.1)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(157,80,255,0.1)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(157,80,255,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(157,80,255,0.04)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(157,80,255,0.1)";
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0 mt-0.5">
                          {item.content_type === "seo_article" ? "📄" : item.content_type === "linkedin_post" ? "💼" : item.content_type === "video_recap" ? "🎬" : "🐦"}
                        </span>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium truncate text-white transition-colors"
                          >
                            {item.title || "Untitled"}
                          </p>
                          {item.video_url && (
                            <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                              {item.video_url}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                              {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <span className="oracle-chip text-[9px]">Completed</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEO FAQ */}
          <div className="max-w-2xl">
            <DashboardFaq />
          </div>
        </main>

        {/* ── Streaming Drawer — right side ───────────────── */}
        <div className="sticky flex-shrink-0 self-start" style={{ top: 72, height: "calc(100vh - 72px)" }}>
          <StreamingDrawer
            isOpen={drawerOpen}
            isStreaming={isStreaming}
            content={streamedContent || generatedContent}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      </div>

      {/* ── Floating terminal (synthesis console) ───────── */}
      {(isStreaming || terminalOpen) && (
        <FloatingTerminal
          isStreaming={isStreaming}
          isOpen={terminalOpen}
          onToggle={() => setTerminalOpen((o) => !o)}
        />
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        charsRemaining={charsRemaining}
        packages={overLimitPackages}
        billingNote={overLimitBillingNote}
        onClose={() => setPurchaseModalOpen(false)}
        onPurchase={handlePurchase}
      />
    </div>
  );
}
