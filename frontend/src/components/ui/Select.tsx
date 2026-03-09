'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  error,
  fullWidth = true,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx('relative', fullWidth && 'w-full', className)}
    >
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl',
          'bg-white/5 border text-left transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
          error
            ? 'border-red-500/50'
            : isOpen
            ? 'border-violet-500/50'
            : 'border-white/10 hover:border-white/20'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={clsx('text-sm', selectedOption ? 'text-white' : 'text-white/30')}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-white/40 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 rounded-xl glass border border-white/10 shadow-card-hover overflow-hidden"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full flex items-start justify-between px-4 py-3 text-left transition-colors duration-150',
                option.value === value
                  ? 'bg-violet-600/20 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-white/40 mt-0.5">{option.description}</p>
                )}
              </div>
              {option.value === value && (
                <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
