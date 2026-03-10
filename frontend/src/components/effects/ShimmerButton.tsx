"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ShimmerButton({
  children,
  className = "",
  size = "md",
  ...props
}: ShimmerButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl overflow-hidden text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${sizeClasses[size]} ${className}`}
      style={{
        background: "linear-gradient(135deg, #10B981, #059669, #047857)",
        backgroundSize: "200% 200%",
        boxShadow: "0 0 20px rgba(16,185,129,0.4), 0 0 60px rgba(5,150,105,0.15)",
      }}
      {...props}
    >
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
          animation: "shimmer 2.5s infinite",
          willChange: "transform",
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
