import React from 'react';

/**
 * Base Shimmer Primitive
 */
export function SkeletonBlock({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({ className = 'h-4 w-full', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      style={style}
    />
  );
}

export function SkeletonMedia({ className = 'h-48 w-full', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer rounded-2xl ${className}`}
      style={style}
    />
  );
}

export function SkeletonButton({ className = 'h-11 w-32', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      style={style}
    />
  );
}

/**
 * Generic Card Skeleton with flexible layout props
 */
export default function CardSkeleton({
  hasMedia = false,
  mediaHeight = 'h-48',
  lines = 3,
  hasButton = true,
  className = '',
}) {
  return (
    <div className={`p-5 rounded-3xl border border-white/10 bg-[#111111] space-y-4 overflow-hidden ${className}`}>
      {hasMedia && <SkeletonMedia className={`${mediaHeight} w-full`} />}
      <div className="space-y-2.5">
        <SkeletonText className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonText
            key={i}
            className={`h-4 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`}
          />
        ))}
      </div>
      {hasButton && (
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <SkeletonText className="h-6 w-24" />
          <SkeletonButton className="h-10 w-28 rounded-xl" />
        </div>
      )}
    </div>
  );
}
