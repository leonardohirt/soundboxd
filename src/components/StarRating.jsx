import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating = 0, onRatingChange, readonly = false, size = 18 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (val) => {
    if (!readonly && onRatingChange) {
      onRatingChange(val);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars.map((starIndex) => {
        const fillAmount = Math.max(0, Math.min(1, displayRating - (starIndex - 1)));
        const isHalf = fillAmount > 0 && fillAmount < 1;
        const isFull = fillAmount === 1;

        return (
          <div
            key={starIndex}
            style={{
              position: 'relative',
              cursor: readonly ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={(e) => {
              if (readonly) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              const value = clickPos <= 0.5 ? starIndex - 0.5 : starIndex;
              handleClick(value);
            }}
            onMouseMove={(e) => {
              if (readonly) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const hoverPos = (e.clientX - rect.left) / rect.width;
              const value = hoverPos <= 0.5 ? starIndex - 0.5 : starIndex;
              setHoverRating(value);
            }}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          >
            {/* Background Empty Star */}
            <Star size={size} color="#343a40" fill="none" />
            
            {/* Filled Star overlay */}
            {(isFull || isHalf) && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: isFull ? '100%' : '50%',
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}
              >
                <Star size={size} color="#ffb703" fill="#ffb703" />
              </div>
            )}
          </div>
        );
      })}
      {rating > 0 && readonly && (
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffb703', marginLeft: '4px' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
