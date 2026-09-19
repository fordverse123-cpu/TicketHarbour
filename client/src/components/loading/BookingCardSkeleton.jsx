import React from 'react';
import { SkeletonBlock, SkeletonText, SkeletonButton } from './CardSkeleton';

export default function BookingCardSkeleton() {
  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-[#111111] space-y-4 overflow-hidden">
      {/* Top Ref & Status Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-6 w-24 rounded-lg" />
          <SkeletonBlock className="h-6 w-32 rounded-lg" />
        </div>
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>

      {/* Main Booking Info */}
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-64 sm:w-80 rounded-lg" />
        <SkeletonText className="h-4 w-48" />
        <SkeletonText className="h-4 w-36" />
      </div>

      {/* Bottom Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
        <div className="space-y-1">
          <SkeletonText className="h-3 w-20" />
          <SkeletonBlock className="h-7 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonButton className="h-10 w-28 rounded-xl" />
          <SkeletonButton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
