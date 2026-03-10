"use client";

import { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:border-white/20 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={selected ? "text-white" : "text-slate-500"}>
            {selected ? selected.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute z-50 w-full mt-1 glass rounded-xl border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            role="listbox"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`w-full flex items-center px-4 py-2.5 text-sm text-left transition-colors duration-150 ${
                  option.value === value
                    ? "text-violet-400 bg-violet-500/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.value === value && (
                  <span className="mr-2 text-violet-400">✓</span>
                )}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
