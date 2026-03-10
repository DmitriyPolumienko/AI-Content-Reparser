"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  className?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, rightElement, className = "", wrapperClassName = "", ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-500 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500
            focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20
            transition-all duration-200 py-2.5 text-sm
            ${icon ? "pl-10" : "pl-4"}
            ${rightElement ? "pr-12" : "pr-4"}
            ${error ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-slate-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
