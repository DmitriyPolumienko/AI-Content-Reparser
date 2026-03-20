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
      className={`oracle-btn-primary relative inline-flex items-center justify-center gap-2 font-semibold overflow-hidden ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
          animation: "shimmer 2.5s infinite",
          willChange: "transform",
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
