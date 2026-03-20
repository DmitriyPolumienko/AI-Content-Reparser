"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
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
      {label && (
        <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white focus:outline-none transition-all duration-300"
          style={{
            background: "rgba(18,20,28,0.5)",
            border: open ? "1px solid rgba(157,80,255,0.5)" : "1px solid rgba(157,80,255,0.15)",
            borderRadius: 8,
            boxShadow: open ? "0 0 0 3px rgba(157,80,255,0.1)" : "none",
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span style={{ color: selected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}>
            {selected ? (
              <span className="flex items-center gap-2">
                {selected.icon && <span className="flex-shrink-0 leading-none">{selected.icon}</span>}
                {selected.label}
              </span>
            ) : placeholder}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            style={{ color: "rgba(157,80,255,0.6)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute z-50 w-full mt-1 overflow-hidden shadow-2xl"
            style={{
              background: "#0C0D11",
              border: "1px solid rgba(157,80,255,0.2)",
              borderRadius: 8,
            }}
            role="listbox"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-left transition-colors duration-150"
                  style={{
                    background: isSelected ? "rgba(157,80,255,0.12)" : "transparent",
                    color: isSelected ? "#9D50FF" : "rgba(255,255,255,0.7)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(157,80,255,0.06)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.9)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {isSelected && (
                    <span className="mr-2" style={{ color: "#9D50FF" }}>✓</span>
                  )}
                  {option.icon && <span className="mr-2 flex-shrink-0 leading-none">{option.icon}</span>}
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
