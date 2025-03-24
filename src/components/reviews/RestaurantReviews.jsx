import React from 'react';
import { Star } from 'lucide-react';
import { getReviewSummary } from '../../utils/reviewUtils';

const TEAL_COLOR = "#0d9488";
const googleLogoUrl = "https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png";

const RestaurantReviews = ({ restaurant }) => {
  // Use the existing eatableReview if available, otherwise calculate from reviews
  const eatableReviewData = restaurant?.eatableReview || getReviewSummary(restaurant?.reviews);

  const reviewHeaderStyle = {
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '4px'
  };

  const quoteStyle = {
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#4b5563',
    margin: '0'
  };

  return (
    <>
      {/* eatABLE Review */}
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <div style={reviewHeaderStyle}>
          <span style={{ marginRight: '8px' }}>🍴</span>
          <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '8px' }}>eatABLE Review</span>
          <div style={{ display: 'flex' }}>
            {[...Array(5)].map((_, i) => {
              const rating = Number(eatableReviewData?.rating || 0);
              const isFullStar = i < Math.floor(rating);
              const isHalfStar = !isFullStar && i === Math.floor(rating) && rating % 1 >= 0.5;
              
              return (
                <Star
                  key={i}
                  size={12}
                  color={TEAL_COLOR}
                  fill={isFullStar ? TEAL_COLOR : isHalfStar ? "url(#halfStarEatable)" : "none"}
                />
              );
            })}
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
            ({eatableReviewData?.reviewCount || 0})
          </span>
        </div>
        <p style={quoteStyle}>"{eatableReviewData?.quote || 'No review available'}"</p>
      </div>

      {/* Google Review */}
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <div style={reviewHeaderStyle}>
          <img 
            src={googleLogoUrl} 
            alt="Google" 
            style={{ width: '16px', height: '16px', marginRight: '8px' }}
          />
          <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '8px' }}>Google Review</span>
          <div style={{ display: 'flex' }}>
            {[...Array(5)].map((_, i) => {
              const rating = Number(restaurant?.googleReview?.rating || 0);
              const isFullStar = i < Math.floor(rating);
              const isHalfStar = !isFullStar && i === Math.floor(rating) && rating % 1 >= 0.5;
              
              return (
                <Star
                  key={i}
                  size={12}
                  color="#facc15"
                  fill={isFullStar ? "#facc15" : isHalfStar ? "url(#halfStar)" : "none"}
                />
              );
            })}
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
            ({restaurant?.googleReview?.reviewCount || 0})
          </span>
        </div>
        <p style={quoteStyle}>"{restaurant?.googleReview?.quote || 'No review available'}"</p>
      </div>

      {/* SVG definitions */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="halfStar">
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#d1d5db" />
          </linearGradient>
          <linearGradient id="halfStarEatable">
            <stop offset="50%" stopColor={TEAL_COLOR} />
            <stop offset="50%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};

export default RestaurantReviews; 