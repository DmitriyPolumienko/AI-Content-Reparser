"use client";

import { ReactNode, useState } from "react";

interface InfiniteMarqueeProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export default function InfiniteMarquee({
  children,
  speed = 40,
  className = "",
}: InfiniteMarqueeProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`overflow-x-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex w-max py-2"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
        }}
      >
        <div className="flex">{children}</div>
        <div className="flex" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
