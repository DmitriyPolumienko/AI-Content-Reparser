'use client';

interface GridPatternProps {
  className?: string;
  fadeEdges?: boolean;
}

export default function GridPattern({ className = '', fadeEdges = true }: GridPatternProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: fadeEdges
          ? 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
          : undefined,
        WebkitMaskImage: fadeEdges
          ? 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
          : undefined,
      }}
    />
  );
}
