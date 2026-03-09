'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth = true, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-white/70"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center focus-glow rounded-xl">
          {leftIcon && (
            <div className="absolute left-3 text-white/40 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30',
              'px-4 py-3 text-sm transition-all duration-200',
              'focus:outline-none focus:border-violet-500/50 focus:bg-white/8',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500/50 focus:border-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-white/40">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-white/40">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
