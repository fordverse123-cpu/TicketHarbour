import React from 'react';
import PixelCard from './PixelCard';

const CATEGORY_VARIANTS = {
  movies: 'pink',
  movie: 'pink',
  events: 'blue',
  event: 'blue',
  sports: 'yellow',
  sport: 'yellow',
  bus: 'blue',
  buses: 'blue',
  train: 'blue',
  trains: 'blue',
  flights: 'default',
  flight: 'default',
  attractions: 'pink',
  attraction: 'pink',
  admin: 'default',
  dashboard: 'default',
};

export default function PixelCardWrapper({
  category = 'default',
  variant,
  className = '',
  children,
  ...props
}) {
  const selectedVariant = variant || CATEGORY_VARIANTS[category.toLowerCase()] || 'default';

  return (
    <PixelCard
      variant={selectedVariant}
      className={className}
      {...props}
    >
      {children}
    </PixelCard>
  );
}
