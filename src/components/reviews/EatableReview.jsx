import React from 'react';
import { Star } from 'lucide-react';

const TEAL_COLOR = "#0d9488";

const EatableReview = ({ review }) => {
  // Debug logs
  console.log('[EatableReview Debug]', {
    receivedReview: review,
    hasText: !!review?.text,
    hasQuote: !!review?.quote,
    helpfulVotes: review?.helpfulVotes,
    reviewCount: review?.reviewCount
  });

  // Get the review text from either review.text or review.quote
  const reviewText = review?.text || review?.quote;
  
  // Get the rating count
  const reviewCount = review?.reviewCount || (review?.helpfulVotes?.length || 0);
  
  // Get the rating value
  const rating = review?.rating || 0;

  // Debug final values
  console.log('[EatableReview Final Values]', {
    reviewText,
    reviewCount,
    rating
  });

  return (
    <div style={{ marginTop: '12px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ marginRight: '8px' }}>🍴</span>
        <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '8px' }}>
          eatABLE Review
        </span>
        <div style={{ display: 'flex' }}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              color={i < Math.floor(rating) ? TEAL_COLOR : "#d1d5db"}
              fill={i < Math.floor(rating) ? TEAL_COLOR : "none"}
            />
          ))}
        </div>
        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
          ({reviewCount})
        </span>
      </div>
      <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#4b5563', margin: '0' }}>
        "{reviewText || 'No review available'}"
      </p>
    </div>
  );
};

export default EatableReview; 