'use client';

import { useRef, useState, ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(124, 58, 237, 0.08)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setSpotlightPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? `radial-gradient(300px circle at ${spotlightPos.x}% ${spotlightPos.y}%, ${spotlightColor}, transparent 70%), rgba(255,255,255,0.03)`
          : 'rgba(255,255,255,0.03)',
        transition: 'background 0.15s ease',
      }}
    >
      {children}
    </div>
  );
}
