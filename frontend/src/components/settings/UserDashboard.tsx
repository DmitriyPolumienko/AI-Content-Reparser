"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface UserDashboardProps {
  userId: string;
  email: string;
  createdAt: string;
  plan: string;
  subscriptionStatus: string | null;
  charsBalance: number;
}

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

export default function UserDashboard({
  userId,
  email,
  createdAt,
  plan,
  subscriptionStatus,
  charsBalance,
}: UserDashboardProps) {
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const planLimit = PLAN_LIMIT[plan] ?? null;
  const parsedDate = new Date(createdAt);
  const memberSince =
    createdAt && !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  const progressPercent =
    planLimit !== null && planLimit > 0
      ? Math.min(100, Math.round((charsBalance / planLimit) * 100))
      : planLimit === null
      ? 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      {/* Account summary */}
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
          Account Summary
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-500">User ID</span>
            <p className="text-sm text-slate-300 font-mono mt-0.5 break-all">
              {userId}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Email</span>
            <p className="text-sm text-white mt-0.5">{email}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Member Since</span>
            <p className="text-sm text-white mt-0.5">{memberSince}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Current Plan</span>
            <p className="text-sm text-emerald-400 font-semibold mt-0.5">
              {planLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Usage stats */}
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
          Usage
        </p>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-slate-400">Characters Remaining</p>
            <p className="text-2xl font-bold text-white font-display mt-0.5">
              {charsBalance.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Subscription Status</p>
            <StatusBadge status={subscriptionStatus} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Balance</span>
            <span>
              {planLimit !== null
                ? `${charsBalance.toLocaleString()} / ${planLimit.toLocaleString()}`
                : "Unlimited"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
          Quick Links
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 transition-all duration-200"
          >
            <DashboardIcon className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/settings/billing"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-transparent border border-white/15 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
          >
            <BillingIcon className="w-4 h-4" />
            Manage Billing
          </Link>
          <Link
            href="/settings/security"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-transparent border border-white/15 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
          >
            <SecurityIcon className="w-4 h-4" />
            Security Settings
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "text-emerald-400" },
    canceled: { label: "Canceled", color: "text-red-400" },
    past_due: { label: "Past Due", color: "text-yellow-400" },
  };
  const s = status
    ? (map[status] ?? { label: status, color: "text-slate-400" })
    : { label: "Free", color: "text-slate-400" };
  return <p className={`font-semibold mt-0.5 ${s.color}`}>{s.label}</p>;
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BillingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function SecurityIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
    </svg>
  );
}
