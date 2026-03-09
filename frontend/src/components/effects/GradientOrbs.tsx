'use client';

interface GradientOrbsProps {
  className?: string;
}

export default function GradientOrbs({ className = '' }: GradientOrbsProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Primary violet orb */}
      <div
        className="orb orb-1"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0) 70%)',
          top: '-100px',
          left: '-100px',
        }}
      />
      {/* Cyan orb */}
      <div
        className="orb orb-2"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(6,182,212,0) 70%)',
          top: '30%',
          right: '-80px',
        }}
      />
      {/* Emerald orb */}
      <div
        className="orb orb-3"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0) 70%)',
          bottom: '-50px',
          left: '30%',
        }}
      />
      {/* Secondary violet orb */}
      <div
        className="orb orb-4"
        style={{
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0) 70%)',
          top: '60%',
          left: '10%',
        }}
      />
    </div>
  );
}
