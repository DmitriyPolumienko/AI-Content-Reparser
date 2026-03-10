"use client";

import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  hover = false,
  glow = false,
  className = "",
  padding = "md",
  ...props
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
        glass-card
        ${paddingClasses[padding]}
        ${hover ? "transition-all duration-300 hover:-translate-y-1 hover:border-white/20 cursor-pointer" : ""}
        ${glow ? "hover:shadow-glow" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
