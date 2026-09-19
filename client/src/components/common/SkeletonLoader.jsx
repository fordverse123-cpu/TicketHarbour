import React from 'react';
import AppLoader from '../AppLoader';

export default function SkeletonLoader({ count = 6 }) {
  return <AppLoader visible={true} mode="contained" text="Loading items..." />;
}
