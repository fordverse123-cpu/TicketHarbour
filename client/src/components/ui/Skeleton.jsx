import React from 'react';

export default function Skeleton({ className = '', count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`bg-white/5 border border-white/10 rounded-2xl animate-pulse ${className}`}
        />
      ))}
    </>
  );
}

export function MovieCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-harbour-card/60 border border-white/10 rounded-2xl p-4 animate-pulse space-y-4">
          <div className="h-64 bg-white/5 rounded-xl" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="w-full h-40 bg-harbour-card/60 border border-white/10 rounded-3xl animate-pulse p-6 space-y-4">
      <div className="h-6 bg-white/10 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-12 bg-white/5 rounded-xl" />
        <div className="h-12 bg-white/5 rounded-xl" />
        <div className="h-12 bg-white/5 rounded-xl" />
        <div className="h-12 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
