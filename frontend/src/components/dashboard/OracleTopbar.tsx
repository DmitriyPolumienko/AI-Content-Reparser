"use client";

import Link from "next/link";

interface OracleTopbarProps {
  charsRemaining: number;
  onStartOver?: () => void;
}

export default function OracleTopbar({ charsRemaining, onStartOver }: OracleTopbarProps) {
  return (
    <header
      className="fixed top-0 z-50 flex items-center justify-between px-6"
      style={{
        left: 260,
        right: 0,
        height: 72,
        background: "rgba(8,9,10,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(157,80,255,0.1)",
      }}
    >
      {/* Left: page title */}
      <div>
        <h1 className="font-display font-semibold text-white text-base tracking-tight">
          Content Studio
        </h1>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          YouTube → AI-powered content
        </p>
      </div>

      {/* Right: usage balance + start over */}
      <div className="flex items-center gap-4">
        <button
          onClick={onStartOver}
          className="text-xs transition-colors duration-300"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#9D50FF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          ↺ New
        </button>

        {/* Balance pill */}
        <div className="oracle-balance-pill">
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Balance: </span>
          <span className="font-semibold" style={{ color: "#9D50FF" }}>
            {(charsRemaining ?? 0).toLocaleString()}
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}> chars</span>
        </div>

        {/* Docs / home link */}
        <Link
          href="/"
          className="text-xs transition-colors duration-300"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          ← Home
        </Link>
      </div>
    </header>
  );
}
