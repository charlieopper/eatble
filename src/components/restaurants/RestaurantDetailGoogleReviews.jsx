import React from 'react';

// Direct URL to Google's G logo
const googleLogoUrl = "https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png";

const RestaurantDetailGoogleReviews = ({ googleReviews }) => {
  return (
    <div className="google-reviews-section">
      <div className="section-header">
        <div className="google-branding">
          <img 
            src={googleLogoUrl}
            alt="Google" 
            className="google-g-logo" 
            width="20" 
            height="20" 
          />
          <span>Google Reviews</span>
        </div>
      </div>
      
      {/* Reviews list */}
      <div className="reviews-list">
        {googleReviews && googleReviews.length > 0 ? (
          googleReviews.map((review, index) => (
            <div key={index} className="review-item">
              {/* Review content */}
            </div>
          ))
        ) : (
          <p>No Google reviews available</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailGoogleReviews; 