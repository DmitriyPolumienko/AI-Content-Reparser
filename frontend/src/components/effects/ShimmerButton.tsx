'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  fullWidth?: boolean;
}

const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', glow = true, fullWidth = false, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 shimmer-btn focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 text-white hover:scale-105 active:scale-95',
      outline:
        'border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-violet-500/50',
      ghost: 'text-white/70 hover:text-white hover:bg-white/5',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-2.5',
    };

    const glowClass = glow && variant === 'primary' ? 'glow hover:glow-lg' : '';

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], glowClass, fullWidth && 'w-full', className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';

export default ShimmerButton;
