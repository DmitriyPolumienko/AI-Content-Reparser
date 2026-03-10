"use client";

export default function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)",
          filter: "blur(120px)",
          opacity: 0.3,
          top: "-10%",
          left: "-10%",
          animation: "float 32s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(5,150,105,0.4) 0%, transparent 70%)",
          filter: "blur(120px)",
          opacity: 0.3,
          top: "20%",
          right: "-10%",
          animation: "float 24s ease-in-out infinite reverse",
          willChange: "transform",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(4,120,87,0.3) 0%, transparent 70%)",
          filter: "blur(120px)",
          opacity: 0.25,
          bottom: "10%",
          left: "30%",
          animation: "float 28s ease-in-out infinite 4s",
          willChange: "transform",
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,78,59,0.35) 0%, transparent 70%)",
          filter: "blur(120px)",
          opacity: 0.25,
          bottom: "-5%",
          right: "20%",
          animation: "float 20s ease-in-out infinite 8s",
          willChange: "transform",
        }}
      />
    </div>
  );
}
