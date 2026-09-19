import React from 'react';
import { CardSkeletonGrid } from '../loading';

export default function SkeletonLoader({ count = 4, CardSkeletonComponent, gridClassName }) {
  return (
    <CardSkeletonGrid
      count={count}
      CardSkeletonComponent={CardSkeletonComponent}
      gridClassName={gridClassName}
    />
  );
}
