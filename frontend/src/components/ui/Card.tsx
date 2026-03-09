'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export default function Card({
  children,
  className,
  hover = false,
  glow = false,
  padding = 'md',
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'rounded-2xl glass border border-white/10',
        paddings[padding],
        hover &&
          'transition-all duration-300 hover:border-white/20 hover:shadow-card-hover hover:-translate-y-1',
        glow && 'hover:glow',
        className
      )}
    >
      {children}
    </div>
  );
}
