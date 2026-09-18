import React from 'react';

export default function SkeletonLoader({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-pulse"
        >
          <div className="h-48 bg-slate-200 dark:bg-slate-700 w-full" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="pt-4 flex items-center justify-between">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
