"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  strings: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
}

export default function TypewriterText({
  strings,
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseTime = 2000,
  className = "",
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (strings.length === 0) return;

    const current = strings[stringIndex];

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timer);
    }

    if (isDeleting) {
      if (displayed.length === 0) {
        setIsDeleting(false);
        setStringIndex((prev) => (prev + 1) % strings.length);
        return;
      }
      const timer = setTimeout(() => {
        setDisplayed((prev) => prev.slice(0, -1));
      }, deleteSpeed);
      return () => clearTimeout(timer);
    }

    if (displayed.length === current.length) {
      setIsPaused(true);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayed(current.slice(0, displayed.length + 1));
    }, typeSpeed);
    return () => clearTimeout(timer);
  }, [displayed, stringIndex, isDeleting, isPaused, strings, typeSpeed, deleteSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayed}
      <span
        className="inline-block w-0.5 h-[1em] bg-current align-middle ml-0.5"
        style={{ animation: "twinkle 1s step-end infinite" }}
      />
    </span>
  );
}
