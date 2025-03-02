import React from 'react';

// Direct URL to Google's G logo
const googleLogoUrl = "https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png";

const GoogleReviewBadge = ({ rating, reviewCount, quote }) => {
  return (
    <div className="google-review-container">
      <div className="google-review-header">
        <div className="google-logo-container">
          <img 
            src={googleLogoUrl}
            alt="Google" 
            className="google-g-logo" 
            width="18" 
            height="18" 
          />
          <span className="google-review-text">Google Review</span>
        </div>
        <div className="rating-stars">
          {Array(5).fill().map((_, i) => (
            <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : 'empty'}`}>★</span>
          ))}
          <span className="review-count">({reviewCount})</span>
        </div>
      </div>
      {quote && <p className="review-quote">"{quote}"</p>}
    </div>
  );
};

export default GoogleReviewBadge; 