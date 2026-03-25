"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { getGeneration, listGenerations, GenerationHistoryItem } from "@/lib/api";
import { PLAN_PERIOD_LIMITS, PLAN_LABELS } from "@/lib/plans";

// ─── Date range type ──────────────────────────────────────────────────────────

type DateRange = "7D" | "14D" | "30D";

// ─── Format badge colors ──────────────────────────────────────────────────────

const FORMAT_COLORS: Record<string, string> = {
  "SEO Article": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "LinkedIn Post": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Twitter Thread": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Video Recap": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const FORMAT_LABEL: Record<string, string> = {
  seo_article: "SEO Article",
  linkedin_post: "LinkedIn Post",
  twitter_thread: "Twitter Thread",
  video_recap: "Video Recap",
};

const PIE_COLORS: Record<string, string> = {
  "SEO Articles": "#10B981",
  "LinkedIn Posts": "#8B5CF6",
  "Twitter Threads": "#3B82F6",
  "Video Recaps": "#F59E0B",
};

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const CARD = "bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-all duration-300";

// ─── Custom recharts tooltips ─────────────────────────────────────────────────

function AreaTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">
        {payload[0].value.toLocaleString()} Generations
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2">
      <p className="text-sm font-semibold text-white">{payload[0].name}</p>
      <p className="text-xs text-slate-400">{payload[0].value}%</p>
    </div>
  );
}

// ─── Circular progress SVG ────────────────────────────────────────────────────

function CircularProgress({ percent }: { percent: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent > 90 ? "#EF4444" : percent > 70 ? "#F59E0B" : "#10B981";

  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="700"
        fill="white"
      >
        {percent}%
      </text>
    </svg>
  );
}

// ─── Helper: compute stats from real generation history ───────────────────────

function computeUsageData(items: GenerationHistoryItem[]): { date: string; count: number }[] {
  const byDate: Record<string, number> = {};
  for (const item of items) {
    const d = new Date(item.created_at);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    byDate[key] = (byDate[key] ?? 0) + 1;
  }
  return Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => {
      const da = new Date(a.date + " 2025");
      const db = new Date(b.date + " 2025");
      return da.getTime() - db.getTime();
    });
}

function computeFormatData(items: GenerationHistoryItem[]): { name: string; value: number; color: string }[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const label = FORMAT_LABEL[item.content_type] ?? item.content_type;
    const pluralLabel = label.endsWith("s") ? label : label + "s";
    counts[pluralLabel] = (counts[pluralLabel] ?? 0) + 1;
  }
  const total = items.length || 1;
  return Object.entries(counts).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
    color: PIE_COLORS[name] ?? "#64748B",
  }));
}

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserDashboardProps {
  userId: string;
  email: string;
  createdAt: string;
  plan: string;
  subscriptionStatus: string | null;
  charsBalance: number;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserDashboard({
  userId,
  email,
  createdAt,
  plan,
  charsBalance,
}: UserDashboardProps) {
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const planLimit = PLAN_PERIOD_LIMITS[plan] ?? null;

  const usedPercent =
    planLimit !== null && planLimit > 0
      ? Math.min(100, Math.round(((planLimit - charsBalance) / planLimit) * 100))
      : 0;

  const lowBalance = planLimit !== null && charsBalance < planLimit * 0.1;

  const animatedBalance = useCountUp(charsBalance);

  // Fetch real generation history
  const [historyItems, setHistoryItems] = useState<GenerationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setHistoryLoading(false); return; }
    listGenerations(userId, 100).then((items) => {
      setHistoryItems(items);
      setHistoryLoading(false);
    });
  }, [userId]);

  const usageData = useMemo(() => computeUsageData(historyItems), [historyItems]);
  const formatData = useMemo(() => computeFormatData(historyItems), [historyItems]);
  const totalGenerations = historyItems.length;

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>("30D");
  const [chartLoading, setChartLoading] = useState(false);

  const handleDateRangeChange = (r: DateRange) => {
    setChartLoading(true);
    setDateRange(r);
    setTimeout(() => setChartLoading(false), 150);
  };

  const filteredUsageData = useMemo(() => {
    if (dateRange === "7D") return usageData.slice(-7);
    if (dateRange === "14D") return usageData.slice(-14);
    return usageData;
  }, [dateRange, usageData]);

  // Accordion state for recent activity
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contentCache, setContentCache] = useState<Record<string, string | null>>({});
  const [loadingContent, setLoadingContent] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (id in contentCache) return;
    setLoadingContent(id);
    const gen = await getGeneration(id);
    setContentCache((prev) => ({ ...prev, [id]: gen?.content ?? null }));
    setLoadingContent(null);
  };

  const displayBalance = animatedBalance;
  const memberSince = new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* Widget 1 — Credit Overview */}
      <motion.div variants={itemVariants} className={CARD}>
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Credit Overview</p>

        <div className="flex items-center gap-4 my-4">
          <CircularProgress percent={usedPercent} />
          <div>
            <p className="text-3xl font-bold text-white font-display">{displayBalance.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Chars Remaining</p>
          </div>
        </div>

        {lowBalance && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-amber-400">Balance running low</p>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Plan:{" "}
          <span className="text-emerald-400 font-semibold">{planLabel}</span>
        </p>
      </motion.div>

      {/* Widget 2 — Usage Area Chart (2 cols) */}
      <motion.div variants={itemVariants} className={`${CARD} md:col-span-2`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-white">Usage Over Time</p>
            <p className="text-xs text-slate-500 mt-0.5">Last {dateRange}</p>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(["7D", "14D", "30D"] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => handleDateRangeChange(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  dateRange === r
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={filteredUsageData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={dateRange === "7D" ? 1 : 3}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<AreaTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#usageGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          {chartLoading && (
            <div className="absolute inset-0 bg-[#0d1117]/60 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Widget 3 — Donut Chart */}
      <motion.div variants={itemVariants} className={CARD}>
        <p className="text-sm font-semibold text-white mb-3">Formats Generated</p>
        {formatData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {formatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 mt-1">
              {formatData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[180px] text-sm text-slate-500">
            No generations yet
          </div>
        )}
      </motion.div>

      {/* Widget 4 — Account Info */}
      <motion.div variants={itemVariants} className={CARD}>
        <p className="text-sm font-semibold text-white mb-4">Account</p>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm text-white truncate">{email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Member Since</p>
            <p className="text-sm text-white">{memberSince}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Plan</p>
            <p className="text-sm text-emerald-400 font-semibold">{planLabel}</p>
          </div>
        </div>
      </motion.div>

      {/* Widget 5 — Quick Stats */}
      <motion.div variants={itemVariants} className={CARD}>
        <p className="text-sm font-semibold text-white mb-4">Quick Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Generations", value: totalGenerations.toLocaleString() },
            { label: "Chars Remaining", value: charsBalance.toLocaleString() },
            { label: "Plan Limit", value: planLimit !== null ? planLimit.toLocaleString() : "∞" },
            { label: "Used %", value: `${usedPercent}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Widget 6 — Recent Activity (full width) */}
      <motion.div variants={itemVariants} className={`${CARD} md:col-span-3`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Recent Activity</p>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : historyItems.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No activity yet. Generate your first content!</p>
        ) : (
        <div>
          {historyItems.slice(0, 10).map((item) => {
            const formatLabel = FORMAT_LABEL[item.content_type] ?? item.content_type;
            return (
            <div key={item.id} className="border-b border-white/5 last:border-0">
              <div
                className="flex items-center justify-between py-3 px-2 hover:bg-white/[0.02] rounded-lg cursor-pointer transition-colors"
                onClick={() => handleToggle(item.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-sm text-slate-300 truncate">{item.title || "Untitled"}</span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${FORMAT_COLORS[formatLabel] ?? "bg-white/10 text-slate-300 border-white/10"}`}>
                    {formatLabel}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-slate-600">{formatRelativeDate(item.created_at)}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expandedId === item.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    key={`content-${item.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-4">
                      <div className="bg-white/[0.02] rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                        {loadingContent === item.id ? (
                          <div className="flex items-center gap-2 text-slate-500">
                            <div className="w-4 h-4 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
                            Loading content…
                          </div>
                        ) : contentCache[item.id] ? (
                          contentCache[item.id]
                        ) : (
                          <span className="text-slate-500 italic">Content not available.</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </div>
        )}
      </motion.div>
    </motion.div>
  );
}
