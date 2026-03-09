'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface StarFieldProps {
  count?: number;
  className?: string;
}

export default function StarField({ count = 80, className = '' }: StarFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }));

    container.innerHTML = '';
    stars.forEach((star) => {
      const el = document.createElement('div');
      el.className = 'star';
      el.style.cssText = `
        left: ${star.x}%;
        top: ${star.y}%;
        width: ${star.size}px;
        height: ${star.size}px;
        opacity: ${Math.random() * 0.5 + 0.1};
        animation: twinkle ${star.duration}s ${star.delay}s ease-in-out infinite;
      `;
      container.appendChild(el);
    });

    return () => {
      container.innerHTML = '';
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
