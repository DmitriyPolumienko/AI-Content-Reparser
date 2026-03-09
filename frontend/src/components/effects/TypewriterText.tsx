'use client';

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
  showCursor?: boolean;
}

export default function TypewriterText({
  texts,
  typingSpeed = 60,
  deletingSpeed = 30,
  pauseTime = 2000,
  className = '',
  showCursor = true,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timer);
    }

    const currentText = texts[textIndex];

    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        const timer = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsPaused(true);
      }
    } else {
      if (displayText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [displayText, isDeleting, isPaused, textIndex, texts, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span
          className="inline-block w-0.5 h-[1em] ml-1 bg-current align-middle"
          style={{ animation: 'twinkle 1s ease-in-out infinite' }}
        />
      )}
    </span>
  );
}
