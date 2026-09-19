import React from 'react';
import { SkeletonBlock, SkeletonText, SkeletonButton } from './CardSkeleton';

export default function FlightCardSkeleton() {
  return (
    <div className="w-full h-auto rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-6 space-y-4 overflow-hidden">
      {/* Airline Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1">
            <SkeletonBlock className="h-6 w-36 sm:w-48 rounded-lg" />
            <SkeletonText className="h-3.5 w-24" />
          </div>
        </div>
        <SkeletonBlock className="h-6 w-24 rounded-lg" />
      </div>

      {/* Flight Timeline */}
      <div className="grid grid-cols-12 gap-2 items-center py-1">
        <div className="col-span-4 space-y-1">
          <SkeletonBlock className="h-8 w-20 sm:w-28 rounded-lg" />
          <SkeletonText className="h-4 w-24" />
        </div>

        <div className="col-span-4 text-center space-y-2">
          <SkeletonText className="h-3 w-16 mx-auto" />
          <SkeletonBlock className="h-1.5 w-full rounded-full" />
          <SkeletonText className="h-3 w-16 mx-auto" />
        </div>

        <div className="col-span-4 space-y-1 flex flex-col items-end">
          <SkeletonBlock className="h-8 w-20 sm:w-28 rounded-lg" />
          <SkeletonText className="h-4 w-24" />
        </div>
      </div>

      {/* Footer: Refund status, Fare & Booking Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
        <div className="space-y-1">
          <SkeletonText className="h-3.5 w-32" />
          <SkeletonBlock className="h-8 w-28 rounded-lg" />
        </div>
        <SkeletonButton className="h-12 w-36 rounded-2xl" />
      </div>
    </div>
  );
}
