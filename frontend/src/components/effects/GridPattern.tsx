"use client";

export default function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage:
          "radial-gradient(ellipse at center, black 20%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 20%, transparent 80%)",
      }}
    />
  );
}
