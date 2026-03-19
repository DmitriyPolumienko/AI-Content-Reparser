"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UrlInput from "./UrlInput";
import SubtitleEditor from "./SubtitleEditor";
import GenerationSettings from "./GenerationSettings";
import type { GenerationSettingsValue } from "./GenerationSettings";
import StreamingDrawer from "./StreamingDrawer";
import PurchaseModal from "./PurchaseModal";
import SkeletonLoader from "./SkeletonLoader";
import LoadingProgress from "./LoadingProgress";
import GradientOrbs from "@/components/effects/GradientOrbs";
import ShimmerButton from "@/components/effects/ShimmerButton";
import Navbar from "@/components/landing/Navbar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ErrorState from "@/components/ui/ErrorState";
import { streamGenerateContent, listGenerations, getGeneration, SymbolPackage, GenerationHistoryItem } from "@/lib/api";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: "Enter URL" },
  { num: 2, label: "Edit Transcript" },
  { num: 3, label: "Configure" },
  { num: 4, label: "Result" },
];

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

    const controller = streamGenerateContent(
      {
        transcript,
        content_type: settings.contentType,
        keywords: settings.keywords,
        language: selectedLanguage ?? undefined,
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
    setSettings({ contentType: "seo_article", keywords: [], toneOfVoice: "professional_expert", includeSourceLink: false, videoUrl: "" });
    setGeneratedContent("");
    setStreamedContent("");
    setError("");
    setErrorCode(null);
    setDrawerOpen(false);
    setIsStreaming(false);
    setPurchaseModalOpen(false);
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

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-x-hidden">
      <GradientOrbs />
      <Navbar variant="dashboard" charsRemaining={charsRemaining} onStartOver={handleStartOver} />

      <div className="pt-16">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-3"
        />

        {/* Main layout — central content + streaming drawer */}
        <div className="flex items-start gap-0 transition-all duration-350 overflow-x-hidden">
          <main className="relative z-10 flex-1 min-w-0 px-4 sm:px-6 pb-10 pt-2 max-w-5xl mx-auto w-full overflow-x-hidden">
            {/* Stats banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-4 mb-6"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <motion.p
                      key={videosProcessed}
                      initial={{ scale: 1.15, color: "#34D399" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-2xl font-bold"
                    >
                      {videosProcessed.toLocaleString()}
                    </motion.p>
                    <p className="text-xs text-slate-500">Videos Processed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">~30s</p>
                    <p className="text-xs text-slate-500">Avg Processing Time</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">98.5%</p>
                    <p className="text-xs text-slate-500">Success Rate</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step indicators */}
            <div className="mb-10">
              <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ background: "linear-gradient(90deg, #10B981, #059669)" }}
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {STEPS.map((s, i) => (
                  <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                        step === s.num
                          ? "border text-emerald-300"
                          : step > s.num
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-white/5 border border-white/10 text-slate-500"
                      }`}
                      style={
                        step === s.num
                          ? {
                              background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))",
                              borderColor: "rgba(16,185,129,0.4)",
                            }
                          : {}
                      }
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          step > s.num
                            ? "bg-emerald-500 text-white"
                            : step === s.num
                            ? "text-white"
                            : "bg-white/10 text-slate-500"
                        }`}
                        style={
                          step === s.num
                            ? { background: "linear-gradient(135deg, #10B981, #059669)" }
                            : {}
                        }
                      >
                        {step > s.num ? "✓" : s.num}
                      </span>
                      <span className="hidden sm:block">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className="h-px w-6 transition-all duration-500"
                        style={{
                          background:
                            step > s.num
                              ? "linear-gradient(90deg, #10B981, #059669)"
                              : "rgba(255,255,255,0.08)",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="glass-card p-6 sm:p-8 min-h-[300px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {step === 1 && <UrlInput onExtract={handleExtract} />}

                  {step === 2 && (
                    <div className="space-y-5">
                      <SubtitleEditor transcript={transcript} onChange={setTranscript} />
                      <div className="flex justify-between pt-2">
                        <button
                          onClick={() => setStep(1)}
                          className="text-sm text-slate-500 hover:text-white transition-colors"
                        >
                          ← Back
                        </button>
                        <ShimmerButton size="md" onClick={() => setStep(3)} disabled={!transcript.trim()}>
                          Next: Configure →
                        </ShimmerButton>
                      </div>
                    </div>
                  )}

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
                          <GenerationSettings onSettingsChange={setSettings} />

                          {error && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                            >
                              ⚠️ {error}
                            </motion.p>
                          )}

                          {loading && (
                            <div className="mt-6">
                              <LoadingProgress
                                message="🪄 Generating your content with AI…"
                                warningMessage="Generating your content... Please don't close this tab."
                              />
                              {!streamedContent && (
                                <div className="mt-4">
                                  <SkeletonLoader />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between pt-2">
                            <button
                              onClick={() => setStep(2)}
                              className="text-sm text-slate-500 hover:text-white transition-colors"
                            >
                              ← Back
                            </button>
                            <ShimmerButton size="md" onClick={handleGenerate} disabled={loading}>
                              {loading ? "Generating..." : "Generate Content →"}
                            </ShimmerButton>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-5">
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Content Generated!</h3>
                        <p className="text-sm text-slate-400 mb-4">
                          Your content is ready in the panel on the right.{" "}
                          {!drawerOpen && (
                            <button
                              onClick={() => setDrawerOpen(true)}
                              className="text-emerald-400 hover:text-emerald-300 underline"
                            >
                              Open drawer
                            </button>
                          )}
                        </p>
                        <p className="text-xs text-slate-600">
                          {generatedContent.length.toLocaleString()} characters generated
                        </p>
                      </div>
                      <div className="flex justify-between pt-2">
                        <button
                          onClick={() => setStep(3)}
                          className="text-sm text-slate-500 hover:text-white transition-colors"
                        >
                          ← Back to Settings
                        </button>
                        <button
                          onClick={handleStartOver}
                          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          + New Content
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quick tips */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/5 rounded-xl p-6"
              >
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <span>💡</span> Pro Tips
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <span className="text-emerald-400">→</span>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">Choose the right language</p>
                      <p className="text-xs text-slate-500 mt-1">Manual transcripts are more accurate than auto-generated ones</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-emerald-400">→</span>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">Videos with good audio work best</p>
                      <p className="text-xs text-slate-500 mt-1">Clear speech = better auto-generated captions</p>
                    </div>
                  </div>

                  {step === 2 && (
                    <>
                      <div className="flex gap-3">
                        <span>✂️</span>
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Trim filler words for cleaner output</p>
                          <p className="text-xs text-slate-500 mt-1">Removing &quot;um&quot;, &quot;uh&quot;, and off-topic tangents helps the AI focus on what matters</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>🎯</span>
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Add context for visuals or demos</p>
                          <p className="text-xs text-slate-500 mt-1">Brief notes about charts or on-screen demos make the generated article much richer</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>🏷️</span>
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Mark your key points</p>
                          <p className="text-xs text-slate-500 mt-1">Highlight or label the most important facts — the AI will turn them into headings and strong copy</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>🌐</span>
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Keep it in one language</p>
                          <p className="text-xs text-slate-500 mt-1">Mixed-language transcripts can confuse the AI — edit to a single language before generating</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>📏</span>
                        <div>
                          <p className="text-sm text-slate-300 font-medium">Ideal length: 500–3,000 words</p>
                          <p className="text-xs text-slate-500 mt-1">Shorter transcripts may produce thin content; longer ones give the AI more material to work with</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </main>

          {/* Streaming Drawer — right side, pushes content */}
          <div className="h-full sticky top-16 flex-shrink-0">
            <StreamingDrawer
              isOpen={drawerOpen}
              isStreaming={isStreaming}
              content={streamedContent || generatedContent}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>

        {/* Last Results — history section */}
        {(history.length > 0 || historyLoading) && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 mt-4">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span>🕐</span> Last Results
              </h3>
              {historyLoading ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistoryItemClick(item)}
                      className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0 mt-0.5">
                          {item.content_type === "seo_article" ? "📄" : item.content_type === "linkedin_post" ? "💼" : item.content_type === "video_recap" ? "🎬" : "🐦"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                            {item.title || "Untitled"}
                          </p>
                          {item.video_url && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{item.video_url}</p>
                          )}
                          <p className="text-[10px] text-slate-600 mt-1">
                            {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
