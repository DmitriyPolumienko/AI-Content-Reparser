"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-slate-700 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-700 rounded-lg w-1/2" />
      <div className="h-4 bg-slate-700 rounded-lg w-5/6" />
      <div className="h-4 bg-slate-700 rounded-lg w-2/3" />
      <div className="h-4 bg-slate-700 rounded-lg w-4/5" />
      <div className="h-4 bg-slate-700 rounded-lg w-1/3" />
    </div>
  );
}
