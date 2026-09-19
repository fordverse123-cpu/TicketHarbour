import React from 'react';
import { SkeletonBlock, SkeletonText, SkeletonButton } from './CardSkeleton';

export default function BusCardSkeleton() {
  return (
    <div className="w-full h-auto min-h-0 self-start rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-6 space-y-4 overflow-hidden">
      {/* Operator & Type Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <SkeletonBlock className="h-7 w-48 sm:w-60 rounded-lg" />
          <SkeletonText className="h-3.5 w-32" />
        </div>
        <SkeletonBlock className="h-6 w-28 rounded-lg" />
      </div>

      {/* Departure -> Duration -> Arrival Timeline */}
      <div className="grid grid-cols-12 gap-2 items-center py-1">
        <div className="col-span-4 space-y-1">
          <SkeletonBlock className="h-8 w-20 sm:w-28 rounded-lg" />
          <SkeletonText className="h-4 w-28" />
        </div>

        <div className="col-span-4 text-center space-y-2">
          <SkeletonText className="h-3 w-16 mx-auto" />
          <SkeletonBlock className="h-1.5 w-full rounded-full" />
          <SkeletonText className="h-3 w-16 mx-auto" />
        </div>

        <div className="col-span-4 space-y-1 flex flex-col items-end">
          <SkeletonBlock className="h-8 w-20 sm:w-28 rounded-lg" />
          <SkeletonText className="h-4 w-28" />
        </div>
      </div>

      {/* Bottom Bar: Seats, Fare & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
        <div className="space-y-1">
          <SkeletonText className="h-3.5 w-28" />
          <SkeletonBlock className="h-8 w-28 rounded-lg" />
        </div>
        <SkeletonButton className="h-12 w-36 rounded-2xl" />
      </div>
    </div>
  );
}
