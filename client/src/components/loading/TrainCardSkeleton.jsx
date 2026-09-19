import React from 'react';
import { SkeletonBlock, SkeletonText, SkeletonButton } from './CardSkeleton';

export default function TrainCardSkeleton() {
  return (
    <div className="w-full h-auto rounded-3xl overflow-hidden border border-white/10 bg-[#111111]">
      <div className="flex flex-col md:flex-row w-full bg-[#111111] h-full">
        {/* Left Main Information Panel */}
        <div className="p-5 sm:p-6 flex-1 space-y-4">
          {/* Train Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-7 w-20 rounded-xl" />
              <SkeletonText className="h-7 w-48 sm:w-64" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-6 w-20 rounded-lg" />
              <SkeletonBlock className="h-6 w-24 rounded-lg" />
            </div>
          </div>

          {/* Departure -> Duration -> Arrival Timeline */}
          <div className="grid grid-cols-12 gap-2 items-center py-2">
            {/* Departure */}
            <div className="col-span-4 space-y-1">
              <SkeletonBlock className="h-9 w-24 sm:w-32 rounded-lg" />
              <SkeletonText className="h-4 w-28" />
            </div>

            {/* Duration Graphic */}
            <div className="col-span-4 text-center space-y-2">
              <SkeletonText className="h-3 w-16 mx-auto" />
              <SkeletonBlock className="h-1.5 w-full rounded-full" />
              <SkeletonText className="h-3 w-16 mx-auto" />
            </div>

            {/* Arrival */}
            <div className="col-span-4 space-y-1 flex flex-col items-end">
              <SkeletonBlock className="h-9 w-24 sm:w-32 rounded-lg" />
              <SkeletonText className="h-4 w-28" />
            </div>
          </div>

          {/* Class Selection Chips & Availability Status */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <SkeletonText className="h-3 w-36" />
              <SkeletonText className="h-3 w-24" />
            </div>

            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-2xl border border-white/10 bg-white/5 min-w-[110px] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <SkeletonText className="h-4 w-8" />
                    <SkeletonText className="h-4 w-12" />
                  </div>
                  <SkeletonBlock className="h-3 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pricing & Booking Panel */}
        <div className="bg-[#171717] p-6 md:w-72 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <SkeletonText className="h-3 w-24" />
            <SkeletonBlock className="h-10 w-32 rounded-xl" />
            <SkeletonText className="h-4 w-44" />
          </div>

          <div className="space-y-2.5">
            <SkeletonButton className="w-full h-14 rounded-2xl" />
            <SkeletonButton className="w-full h-9 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
