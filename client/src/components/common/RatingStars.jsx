import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 4.5, numReviews = 0 }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <div className="flex items-center text-amber-400">
        <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
      </div>
      <span className="font-bold text-slate-800 dark:text-slate-100">{rating.toFixed(1)}</span>
      {numReviews > 0 && (
        <span className="text-slate-400">({numReviews})</span>
      )}
    </div>
  );
}
