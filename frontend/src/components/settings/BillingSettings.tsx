"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/effects/Toast";
import Button from "@/components/ui/Button";

interface Plan {
  id: string;
  name: string;
  price: string;
  chars: string;
  features: string[];
  priceId: string;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    chars: "50,000 Chars / week",
    priceId: "",
    features: [
      "50,000 chars per week",
      "3 content formats",
      "Standard processing speed",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19 / mo",
    chars: "500,000 Chars / day",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "price_pro_placeholder",
    highlight: true,
    features: [
      "500,000 chars per day",
      "All content formats",
      "Priority processing",
      "Advanced AI models",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$79 / mo",
    chars: "Unlimited Chars",
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID ?? "price_enterprise_placeholder",
    features: [
      "Unlimited chars",
      "All content formats",
      "Dedicated processing",
      "Custom integrations",
      "Priority support",
    ],
  },
];

interface BillingSettingsProps {
  currentPlan: string;
  subscriptionStatus: string | null;
  charsBalance: number;
}

export default function BillingSettings({
  currentPlan,
  subscriptionStatus,
  charsBalance,
}: BillingSettingsProps) {
  const [retentionModal, setRetentionModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const { showToast } = useToast();

  const handleUpgrade = async (priceId: string, planId: string) => {
    if (!priceId) return;
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error ?? "Failed to create checkout session.", "error");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error ?? "Failed to open billing portal.", "error");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Current usage */}
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
          Current Usage
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Characters Balance</p>
            <p className="text-2xl font-bold text-white font-display mt-0.5">
              {charsBalance.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Subscription Status</p>
            <StatusBadge status={subscriptionStatus} />
          </div>
        </div>
      </div>

      {/* Pricing plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`glass-card p-5 flex flex-col gap-4 relative ${
                plan.highlight
                  ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                  : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-3 py-0.5 rounded-full font-medium">
                  Popular
                </span>
              )}
              <div>
                <p className="font-display font-bold text-white text-lg">{plan.name}</p>
                <p className="text-emerald-400 font-semibold text-xl mt-0.5">{plan.price}</p>
                <p className="text-slate-400 text-xs mt-1">{plan.chars}</p>
              </div>
              <ul className="flex flex-col gap-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="text-center text-sm text-slate-500 border border-white/10 rounded-xl py-2">
                  Current Plan
                </span>
              ) : plan.id === "free" ? (
                <span className="text-center text-sm text-slate-500">—</span>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleUpgrade(plan.priceId, plan.id)}
                  disabled={checkoutLoading === plan.id}
                >
                  {checkoutLoading === plan.id ? "Redirecting…" : "Upgrade"}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Manage Subscription */}
      {currentPlan !== "free" && (
        <div className="glass-card p-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
            Manage Subscription
          </p>
          <p className="text-sm text-slate-400 mb-4">
            Update payment method, download invoices, or cancel your subscription.
          </p>
          <Button
            variant="outline"
            onClick={() => setRetentionModal(true)}
            disabled={portalLoading}
          >
            {portalLoading ? "Opening…" : "Manage Subscription"}
          </Button>
        </div>
      )}

      {/* Retention modal */}
      <AnimatePresence>
        {retentionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setRetentionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card max-w-md w-full p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Are you sure?
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                If you cancel, you will lose access to:
              </p>
              <ul className="flex flex-col gap-1.5 mb-6">
                {["Priority processing", "Advanced AI models", "Higher chars limit"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-red-400">✕</span>
                      {f}
                    </li>
                  )
                )}
              </ul>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setRetentionModal(false)}
                >
                  Stay on Plan
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-slate-400"
                  onClick={() => { setRetentionModal(false); handlePortal(); }}
                >
                  Proceed Anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "text-emerald-400" },
    canceled: { label: "Canceled", color: "text-red-400" },
    past_due: { label: "Past Due", color: "text-yellow-400" },
  };
  const s = status ? (map[status] ?? { label: status, color: "text-slate-400" }) : { label: "Free", color: "text-slate-400" };
  return <p className={`font-semibold mt-0.5 ${s.color}`}>{s.label}</p>;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
