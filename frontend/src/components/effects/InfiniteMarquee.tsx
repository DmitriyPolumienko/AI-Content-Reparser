'use client';

import { ReactNode } from 'react';

interface InfiniteMarqueeProps {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

export default function InfiniteMarquee({
  children,
  speed = 30,
  reverse = false,
  pauseOnHover = true,
  className = '',
}: InfiniteMarqueeProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div
        className="flex w-max gap-8"
        style={{
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${speed}s linear infinite`,
          animationPlayState: pauseOnHover ? 'var(--play-state, running)' : 'running',
        }}
        onMouseEnter={
          pauseOnHover
            ? (e) => ((e.currentTarget.style as CSSStyleDeclaration).setProperty('--play-state', 'paused'))
            : undefined
        }
        onMouseLeave={
          pauseOnHover
            ? (e) => ((e.currentTarget.style as CSSStyleDeclaration).setProperty('--play-state', 'running'))
            : undefined
        }
      >
        {/* Duplicate children for seamless loop */}
        {children}
        {children}
      </div>
    </div>
  );
}
