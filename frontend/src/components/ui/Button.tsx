'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed shimmer-btn';

    const variants = {
      primary:
        'bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98] glow hover:glow-lg',
      secondary:
        'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700',
      outline:
        'border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-violet-500/50 backdrop-blur-sm',
      ghost: 'text-white/70 hover:text-white hover:bg-white/5',
      danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
