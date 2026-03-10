"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  glow = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const variantClasses = {
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50",
    secondary:
      "bg-white/10 hover:bg-white/15 text-white border border-white/10",
    outline:
      "bg-transparent border border-white/15 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5",
    ghost:
      "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    gradient:
      "bg-gradient-to-r from-emerald-600 to-emerald-400 text-white border-0 hover:opacity-90",
  };

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${glow ? "shadow-glow hover:shadow-glow-lg" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
