"use client";

import { useState, useEffect } from "react";
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
import { Zap, ChevronDown } from "lucide-react";
import { getGeneration } from "@/lib/api";

// ─── Mock data ────────────────────────────────────────────────────────────────

const USAGE_DATA = [
  { date: "Feb 20", chars: 1200 },
  { date: "Feb 21", chars: 3400 },
  { date: "Feb 22", chars: 800 },
  { date: "Feb 23", chars: 5200 },
  { date: "Feb 24", chars: 2100 },
  { date: "Feb 25", chars: 4800 },
  { date: "Feb 26", chars: 1900 },
  { date: "Feb 27", chars: 6300 },
  { date: "Feb 28", chars: 3700 },
  { date: "Mar 01", chars: 2900 },
  { date: "Mar 02", chars: 8100 },
  { date: "Mar 03", chars: 4200 },
  { date: "Mar 04", chars: 5600 },
  { date: "Mar 05", chars: 3100 },
  { date: "Mar 06", chars: 7400 },
  { date: "Mar 07", chars: 2800 },
  { date: "Mar 08", chars: 9200 },
  { date: "Mar 09", chars: 4500 },
  { date: "Mar 10", chars: 6100 },
  { date: "Mar 11", chars: 3300 },
];

const FORMAT_DATA = [
  { name: "SEO Articles", value: 45, color: "#10B981" },
  { name: "LinkedIn Posts", value: 30, color: "#8B5CF6" },
  { name: "Twitter Threads", value: 15, color: "#3B82F6" },
  { name: "Video Recaps", value: 10, color: "#F59E0B" },
];

const RECENT_ACTIVITY = [
  { id: "1", title: "How to Build a SaaS in 30 Days", format: "SEO Article", cost: 3200, date: "2 hours ago", videoUrl: "https://youtube.com" },
  { id: "2", title: "The Future of AI in Content Creation", format: "LinkedIn Post", cost: 1800, date: "5 hours ago", videoUrl: "https://youtube.com" },
  { id: "3", title: "10 Productivity Hacks for Developers", format: "Twitter Thread", cost: 950, date: "1 day ago", videoUrl: "https://youtube.com" },
  { id: "4", title: "Why TypeScript is Worth Learning", format: "Video Recap", cost: 2100, date: "2 days ago", videoUrl: "https://youtube.com" },
  { id: "5", title: "Building Real-time Apps with Supabase", format: "SEO Article", cost: 4400, date: "3 days ago", videoUrl: "https://youtube.com" },
];

const TOTAL_CHARS_PROCESSED = USAGE_DATA.reduce((sum, d) => sum + d.chars, 0);

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLAN_LIMIT: Record<string, number | null> = {
  free: 50_000,
  pro: 500_000,
  enterprise: null,
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

// ─── Date range type ──────────────────────────────────────────────────────────

type DateRange = "7D" | "14D" | "30D";

// ─── Format badge colors ──────────────────────────────────────────────────────

const FORMAT_COLORS: Record<string, string> = {
  "SEO Article": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "LinkedIn Post": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Twitter Thread": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Video Recap": "bg-amber-500/10 text-amber-400 border-amber-500/20",
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

const FORMAT_BADGE_COLORS: Record<string, string> = {
  "SEO Article": "bg-emerald-500/15 text-emerald-400",
  "LinkedIn Post": "bg-violet-500/15 text-violet-400",
  "Twitter Thread": "bg-blue-500/15 text-blue-400",
  "Video Recap": "bg-amber-500/15 text-amber-400",
};

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
        {payload[0].value.toLocaleString()} Chars
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
  plan,
  charsBalance,
}: UserDashboardProps) {
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const planLimit = PLAN_LIMIT[plan] ?? null;

  const usedPercent =
    planLimit !== null && planLimit > 0
      ? Math.min(100, Math.round(((planLimit - charsBalance) / planLimit) * 100))
      : 0;

  const lowBalance = planLimit !== null && charsBalance < planLimit * 0.1;

  const animatedBalance = useCountUp(charsBalance);
  const timeSaved = Math.round((TOTAL_CHARS_PROCESSED / 1000) * 0.5);
  const animatedTimeSaved = useCountUp(timeSaved);

  // Fix 5 — date range state
  const [dateRange, setDateRange] = useState<DateRange>("30D");

  const filteredUsageData = dateRange === "7D"
    ? USAGE_DATA.slice(-7)
    : dateRange === "14D"
    ? USAGE_DATA.slice(-14)
    : USAGE_DATA;

  // Fix 9 — accordion state
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
                onClick={() => setDateRange(r)}
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
              dataKey="chars"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#usageGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Widget 3 — Donut Chart */}
      <motion.div variants={itemVariants} className={CARD}>
        <p className="text-sm font-semibold text-white mb-3">Formats Generated</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={FORMAT_DATA}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              strokeWidth={0}
            >
              {FORMAT_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 mt-1">
          {FORMAT_DATA.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-slate-400">{item.name}</span>
              </div>
              <span className="text-slate-300 font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Widget 4 — Time Saved */}
      <motion.div variants={itemVariants} className={CARD}>
        <p className="text-sm font-semibold text-white mb-4">Time Saved (Est.)</p>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group inline-block">
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 cursor-help">
              <Zap className="w-6 h-6 text-violet-400" style={{ filter: "drop-shadow(0 0 6px #8B5CF6)" }} />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#0d1117] border border-white/10 rounded-lg text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              ~0.5h per 1k Chars processed
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white font-display leading-none">
              {animatedTimeSaved}
            </p>
            <p className="text-xs text-slate-400 mt-1">hours this month</p>
          </div>
        </div>
      </motion.div>

      {/* Widget 5 — Recent Activity (full width) */}
      <motion.div variants={itemVariants} className={`${CARD} md:col-span-3`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Recent Activity</p>
        </div>

        <div>
          {RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="border-b border-white/5 last:border-0">
              <div
                className="flex items-center justify-between py-3 px-2 hover:bg-white/[0.02] rounded-lg cursor-pointer transition-colors"
                onClick={() => handleToggle(item.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-sm text-slate-300 truncate">{item.title}</span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${FORMAT_COLORS[item.format] ?? "bg-white/10 text-slate-300 border-white/10"}`}>
                    {item.format}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-slate-500 hidden sm:block">- {item.cost.toLocaleString()} Chars</span>
                  <span className="text-xs text-slate-600">{item.date}</span>
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
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

