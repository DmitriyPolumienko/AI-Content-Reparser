"use client";

import Image from "next/image";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;

interface OracleSidebarProps {
  step: Step;
  onStepClick?: (s: Step) => void;
  onStartOver?: () => void;
}

const NAV_STEPS: { num: Step; label: string; icon: React.ReactNode }[] = [
  {
    num: 1,
    label: "Enter URL",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    num: 2,
    label: "Edit Transcript",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    num: 3,
    label: "Configure",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    num: 4,
    label: "Result",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const EXTRA_LINKS = [
  { href: "/", label: "Home", icon: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { href: "/#pricing", label: "Pricing", icon: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { href: "/blog", label: "Blog", icon: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  )},
];

export default function OracleSidebar({ step, onStepClick, onStartOver }: OracleSidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col"
      style={{
        width: 260,
        background: "#12141C",
        borderRight: "1px solid rgba(157,80,255,0.1)",
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: 72, borderBottom: "1px solid rgba(157,80,255,0.08)" }}
      >
        <Image src="/logo-icon.png" alt="V2Post logo" width={32} height={32} className="opacity-90" />
        <span className="font-bold text-white font-display text-base tracking-tight">
          V2<span style={{ color: "#9D50FF" }}>Post</span>
        </span>
      </div>

      {/* Workflow steps */}
      <nav className="flex-1 overflow-y-auto py-4">
        <p
          className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Workflow
        </p>

        {NAV_STEPS.map((s) => {
          const isActive = s.num === step;
          const isDone = s.num < step;
          return (
            <button
              key={s.num}
              onClick={() => onStepClick?.(s.num)}
              disabled={s.num > step}
              className={`oracle-nav-item w-full text-left ${isActive ? "active" : ""}`}
              style={{
                opacity: s.num > step ? 0.35 : 1,
                cursor: s.num > step ? "default" : "pointer",
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: isActive
                    ? "#9D50FF"
                    : isDone
                    ? "rgba(157,80,255,0.25)"
                    : "rgba(255,255,255,0.08)",
                  color: isActive ? "#fff" : isDone ? "#9D50FF" : "rgba(255,255,255,0.4)",
                }}
              >
                {isDone ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.num
                )}
              </span>
              {s.icon}
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div
          className="my-4 mx-5"
          style={{ height: 1, background: "rgba(157,80,255,0.08)" }}
        />

        <p
          className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Navigation
        </p>

        {EXTRA_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="oracle-nav-item flex">
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}

        {onStartOver && (
          <button
            onClick={onStartOver}
            className="oracle-nav-item w-full text-left"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Start Over</span>
          </button>
        )}
      </nav>

      {/* Footer — Upgrade CTA */}
      <div
        className="flex-shrink-0 p-4"
        style={{ borderTop: "1px solid rgba(157,80,255,0.08)" }}
      >
        <div
          className="p-3 rounded-[8px] mb-3"
          style={{ background: "rgba(157,80,255,0.08)", border: "1px solid rgba(157,80,255,0.15)" }}
        >
          <p className="text-xs font-semibold text-white mb-0.5">Free Plan</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Upgrade for unlimited access
          </p>
        </div>
        <Link
          href="/#pricing"
          className="oracle-btn-primary flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold"
          style={{ borderRadius: 8 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Upgrade Plan
        </Link>
      </div>
    </aside>
  );
}
