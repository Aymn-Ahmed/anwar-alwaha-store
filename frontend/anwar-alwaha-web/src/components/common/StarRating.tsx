import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, count, size = 14 }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 font-medium">({count})</span>
      )}
    </div>
  );
};
