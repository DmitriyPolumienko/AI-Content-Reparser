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
    primary: "oracle-btn-primary",
    secondary: "oracle-btn-secondary",
    outline:
      "bg-transparent border border-[rgba(157,80,255,0.25)] text-[rgba(255,255,255,0.7)] hover:text-white hover:border-[rgba(157,80,255,0.5)] hover:bg-[rgba(157,80,255,0.08)] transition-all duration-300",
    ghost:
      "bg-transparent text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(157,80,255,0.08)] transition-all duration-300",
    gradient:
      "bg-gradient-to-r from-[#9D50FF] to-[#BD00FF] text-white border-0 hover:opacity-90 transition-all duration-300",
  };

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-[8px]
        focus:outline-none focus:ring-2 focus:ring-[rgba(157,80,255,0.5)]
        disabled:opacity-45 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${glow ? "oracle-glow" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
