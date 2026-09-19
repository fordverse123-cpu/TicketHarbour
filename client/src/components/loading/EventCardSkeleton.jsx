import React from 'react';
import { SkeletonBlock, SkeletonText, SkeletonButton, SkeletonMedia } from './CardSkeleton';

export default function EventCardSkeleton() {
  return (
    <div className="p-0 overflow-hidden flex flex-col justify-between bg-[#111111] rounded-3xl border border-white/10 h-full">
      {/* Banner Media Placeholder */}
      <SkeletonMedia className="h-52 w-full rounded-none" />

      {/* Event Details */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <SkeletonBlock className="h-5 w-28 rounded-full" />
            <SkeletonBlock className="h-5 w-12 rounded-full" />
          </div>
          <SkeletonBlock className="h-6 w-4/5 rounded-lg" />
          <SkeletonText className="h-4 w-2/3" />
          <SkeletonText className="h-4 w-full" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="space-y-1">
            <SkeletonText className="h-3 w-16" />
            <SkeletonBlock className="h-6 w-20 rounded-md" />
          </div>
          <SkeletonButton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
