import React from 'react';
import CardSkeleton from './CardSkeleton';

export default function CardSkeletonGrid({
  count = 4,
  CardSkeletonComponent = CardSkeleton,
  gridClassName = 'space-y-6',
  ariaLabel = 'Loading content...',
}) {
  const items = Array.from({ length: count });

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={`w-full ${gridClassName}`}
    >
      {items.map((_, index) => (
        <CardSkeletonComponent key={index} />
      ))}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}
