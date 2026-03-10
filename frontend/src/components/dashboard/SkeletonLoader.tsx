"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-4 bg-white/5 rounded-full w-3/4" />
      <div className="h-4 bg-white/5 rounded-full w-1/2" />

      {/* Content block */}
      <div className="mt-6 space-y-3">
        <div className="h-3 bg-white/5 rounded-full w-full" />
        <div className="h-3 bg-white/5 rounded-full w-5/6" />
        <div className="h-3 bg-white/5 rounded-full w-4/6" />
        <div className="h-3 bg-white/5 rounded-full w-full" />
        <div className="h-3 bg-white/5 rounded-full w-3/4" />
      </div>

      {/* Card placeholders */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="h-16 bg-white/5 rounded-xl" />
        <div className="h-16 bg-white/5 rounded-xl" />
      </div>

      {/* Label placeholder */}
      <div className="flex items-center gap-2 mt-4">
        <div className="w-5 h-5 bg-white/5 rounded-full" />
        <div className="h-3 bg-white/5 rounded-full w-32" />
      </div>
    </div>
  );
}
