"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SymbolPackage } from "@/lib/api";

interface PurchaseModalProps {
  isOpen: boolean;
  charsRemaining: number;
  packages: SymbolPackage[];
  billingNote?: string;
  monthlyPlanSymbols?: number; // for the 5x guard
  onClose: () => void;
  onPurchase: (pkg: SymbolPackage) => void;
}

const PACKAGE_HIGHLIGHTS = [
  { tagline: "Starter", emoji: "⚡", highlight: false },
  { tagline: "Popular", emoji: "🔥", highlight: true },
  { tagline: "Best Value", emoji: "💎", highlight: true },
  { tagline: "Power User", emoji: "🚀", highlight: false },
];

export default function PurchaseModal({
  isOpen,
  charsRemaining,
  packages,
  billingNote,
  monthlyPlanSymbols = 90_000,
  onClose,
  onPurchase,
}: PurchaseModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [purchasedPkg, setPurchasedPkg] = useState<SymbolPackage | null>(null);

  // Front-end guard: max 5× monthly plan symbols
  const maxAllowed = monthlyPlanSymbols * 5;

  const handlePurchase = () => {
    const pkg = packages.find((p) => p.id === selectedId);
    if (!pkg) return;
    if (pkg.symbols > maxAllowed) return;

    // Mock success
    setPurchasedPkg(pkg);
    setPurchased(true);
    onPurchase(pkg);
  };

  const handleClose = () => {
    setPurchased(false);
    setPurchasedPkg(null);
    setSelectedId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="purchase-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="purchase-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4"
          >
            <div className="w-full max-w-md pointer-events-auto bg-[#0d0d1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {purchased && purchasedPkg ? (
                // ── Success state ──────────────────────────────────────────
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5"
                  >
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Purchase Successful!</h3>
                  <p className="text-slate-400 text-sm mb-1">
                    <span className="text-white font-semibold">
                      {purchasedPkg.symbols.toLocaleString()} symbols
                    </span>{" "}
                    have been added to your balance.
                  </p>
                  <p className="text-slate-600 text-xs mb-6">
                    ${purchasedPkg.price_usd.toFixed(2)} will be added to your next subscription renewal.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                  >
                    Continue Generating
                  </button>
                </div>
              ) : (
                // ── Package selection state ────────────────────────────────
                <>
                  {/* Modal header */}
                  <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⚠️</span>
                        <h3 className="text-lg font-bold text-white">Symbol Limit Reached</h3>
                      </div>
                      <p className="text-slate-400 text-sm">
                        You have{" "}
                        <span className="text-white font-medium">
                          {charsRemaining.toLocaleString()}
                        </span>{" "}
                        symbols remaining. Purchase a package to continue.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-slate-500 hover:text-white transition-colors ml-4 mt-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Package list */}
                  <div className="px-6 pb-2 space-y-2.5">
                    {packages.map((pkg, i) => {
                      const meta = PACKAGE_HIGHLIGHTS[i] ?? { tagline: "", emoji: "✨", highlight: false };
                      const isSelected = selectedId === pkg.id;
                      const isOver5x = pkg.symbols > maxAllowed;

                      return (
                        <button
                          key={pkg.id}
                          onClick={() => !isOver5x && setSelectedId(pkg.id)}
                          disabled={isOver5x}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left
                            ${isSelected
                              ? "border-emerald-500/60 bg-emerald-500/10"
                              : "border-white/8 bg-white/4 hover:border-white/20 hover:bg-white/6"
                            }
                            ${isOver5x ? "opacity-40 cursor-not-allowed" : ""}
                          `}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected
                                ? "border-emerald-400 bg-emerald-400"
                                : "border-white/30"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {pkg.symbols.toLocaleString()} symbols
                              </span>
                              {meta.highlight && (
                                <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-medium">
                                  {meta.emoji} {meta.tagline}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{meta.tagline}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-base font-bold text-white">
                              ${pkg.price_usd.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-500">
                              ${((pkg.price_usd / pkg.symbols) * 1000).toFixed(3)}/1k
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Billing note */}
                  {billingNote && (
                    <p className="px-6 pt-2 pb-3 text-xs text-slate-600 leading-relaxed">
                      ℹ️ {billingNote}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={handlePurchase}
                      disabled={!selectedId}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={
                        selectedId
                          ? { background: "linear-gradient(135deg, #10B981, #059669)" }
                          : { background: "rgba(255,255,255,0.07)" }
                      }
                    >
                      {selectedId
                        ? `Purchase ${packages.find((p) => p.id === selectedId)?.symbols.toLocaleString()} symbols — $${packages.find((p) => p.id === selectedId)?.price_usd.toFixed(2)}`
                        : "Select a package"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
