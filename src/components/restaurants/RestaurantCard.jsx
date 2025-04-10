import React, { useState, useEffect } from 'react';
import { Heart, Star, ChefHat, FileText, Clock, Phone, MapPin, Globe } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getReviewQuote } from '../../utils/reviewUtils';
import { calculateAllergenRatings, formatAllergenRatings } from '../../utils/allergens';

// Placeholder restaurant image URL
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fHww&w=1000&q=80";

// Use teal color for allergen indicators, chef available, and eatABLE stars
const TEAL_COLOR = "#0d9488";

// With this URL that points to the Google "G" icon
const googleLogoUrl = "https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png";

// Add this helper function at the top of your file
function validateReviewStructure(reviews) {
  if (!Array.isArray(reviews)) {
    console.error('Reviews is not an array:', reviews);
    return false;
  }
  
  // Check if reviews have the expected structure
  const hasValidStructure = reviews.every(review => {
    const hasAccommodations = review.accommodations !== undefined;
    if (!hasAccommodations) {
      console.warn('Review missing accommodations property:', review);
    }
    return hasAccommodations;
  });
  
  return hasValidStructure;
}

// Add this calculation near the top of your component where you're processing reviews
// Calculate average eatABLE rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  // Filter to only include reviews with ratings
  const reviewsWithRatings = reviews.filter(review => 
    typeof review.rating === 'number' || 
    typeof review.eatableRating === 'number'
  );
  
  if (reviewsWithRatings.length === 0) return 0;
  
  // Sum all ratings
  const sum = reviewsWithRatings.reduce((total, review) => {
    const rating = review.rating || review.eatableRating || 0;
    return total + rating;
  }, 0);
  
  // Calculate and return the average
  return sum / reviewsWithRatings.length;
};

const RestaurantCard = ({ restaurant, onClick }) => {
  const { name, image, cuisines, eatableReview, accommodations } = restaurant;
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [allergenRatings, setAllergenRatings] = useState([]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Fetch reviews for this specific restaurant
  useEffect(() => {
    const fetchReviews = async () => {
      try {        
        // Get the restaurant document from Firestore
        const restaurantRef = doc(db, 'restaurants', restaurant.id.toString());
        const restaurantDoc = await getDoc(restaurantRef);
        
        if (restaurantDoc.exists()) {
          const firestoreData = restaurantDoc.data();
          // Set the reviews
          setReviews(firestoreData.reviews || []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error(`Error fetching reviews for ${restaurant.name}:`, error);
        setReviews([]);
      } finally {
        setReviewsLoaded(true);
      }
    };

    fetchReviews();
  }, [restaurant.id, restaurant.name]);
  
  // Get reviews from any possible location, prioritizing our directly fetched reviews
  const allReviews = reviews.length > 0 ? reviews : 
                    restaurant.eatableReviews || restaurant.reviews || 
                    (restaurant.data && restaurant.data.reviews) || [];
  
  // Check for accommodations
  const hasChefAvailable = allReviews.some(review => {
    return review.chefAvailable === true || 
           review.accommodations?.chefAvailable === true ||
           review.allergenData?.chefManagerAvailable === true;
  });
  
  const hasAllergenMenu = allReviews.some(review => 
    review.allergenMenu === true || 
    review.accommodations?.allergenMenu === true ||
    review.allergenData?.allergenMenuAvailable === true
  );
  // Validate review structure
  const hasValidReviews = restaurant.eatableReviews && 
    validateReviewStructure(restaurant.eatableReviews);
  
  if (restaurant.eatableReviews && !hasValidReviews) {
    console.error('Restaurant has invalid review structure:', restaurant.name);
  }

  // Get the average rating
  const averageEatableRating = calculateAverageRating(reviews);
  
  // Calculate allergen ratings when reviews change
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const ratings = calculateAllergenRatings(reviews);
      const formattedRatings = formatAllergenRatings(ratings);
      setAllergenRatings(formattedRatings);
    }
  }, [reviews]);

  if (!restaurant) {
    return <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', margin: '8px 0' }}>Loading restaurant data...</div>;
  }

  // Destructure with default values
  const {
    id,
    hours = 'Hours not available',
    phone = 'Phone not available',
    address = '123 Main St, San Francisco, CA 94105', // Placeholder address
    website,
    googleReview = { rating: 0, reviewCount: 0, quote: 'No reviews yet' },
    allergens = [
      { 
        name: 'Peanuts', 
        icon: '🥜',
        rating: { count: 3, average: 4.7 } 
      },
      { 
        name: 'Tree nuts', 
        icon: '🌰',
        rating: { count: 2, average: 5.0 }
      },
      { 
        name: 'Dairy', 
        icon: '🥛',
        rating: { count: 4, average: 4.2 } 
      },
      { 
        name: 'Gluten', 
        icon: '🌾',
        rating: { count: 5, average: 4.8 } 
      },
      { 
        name: 'Shellfish', 
        icon: '🦐',
        rating: { count: 2, average: 4.5 } 
      },
      { 
        name: 'Soy', 
        icon: '🫘',
        rating: { count: 3, average: 4.1 } 
      }
    ],
  } = restaurant;

  // Create map URL for the address
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;

  // Use inline styles to ensure they're applied regardless of Tailwind
  const cardHoverStyle = {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#f9fafb'
  };

  const cardStyle = {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    maxWidth: window.innerWidth <= 640 ? '100%' : '1400px',  // Add max-width for desktop
    margin: window.innerWidth <= 640 ? '0 0 16px 0' : '0 auto 16px auto',  // Center on desktop
    ...(isHovered ? cardHoverStyle : {})
  };

  const flexRowStyle = {
    display: 'flex',
    height: '100%'
  };

  const flexColumnStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const imageContainerStyle = {
    width: '33%',
    height: '200px',
    position: 'relative',
    backgroundColor: '#f3f4f6'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const contentStyle = {
    flex: 1,
    padding: '16px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px'
  };

  const cuisineTagStyle = {
    padding: '4px 8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    fontSize: '12px',
    marginRight: '4px',
    marginBottom: '4px',
    display: 'inline-block'
  };

  const btnStyle = {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px'
  };

  const accommodationStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: TEAL_COLOR,
    marginRight: '12px'
  };

  const contactStyle = {
    fontSize: '14px',
    color: '#4b5563',
    marginTop: '8px',
    marginBottom: '8px'
  };

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

  const allergenTagStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#ccfbf1',
    border: '1px solid #99f6e4',
    borderRadius: '9999px',
    fontSize: '12px',
    color: TEAL_COLOR,
    marginRight: '4px',
    marginBottom: '4px'
  };

  const renderGoogleRating = (rating, reviewCount) => {
    return (
      <div className="google-rating">
        <img 
          src={googleLogoUrl} 
          alt="Google" 
          style={{ width: '16px', height: '16px', marginRight: '8px' }}
        />
        <span className="rating">{rating}</span>
        <span className="count">({reviewCount})</span>
      </div>
    );
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/restaurant/${id}`);
      }}
    >
      {/* Left column - Image and hours/contact */}
      <div style={{ 
        width: '33%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Restaurant image */}
        <div style={{
          height: '200px',
          position: 'relative',
          backgroundColor: '#f3f4f6'
        }}>
          <img 
            src={image || PLACEHOLDER_IMAGE} 
            alt={name} 
            style={imageStyle}
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
          
          {/* Favorite Button - MOVED HERE */}
          <button 
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(restaurant);
            }}
          >
            <Heart 
              color={isFavorite(id) ? "#EB4D4D" : "currentColor"}
              fill={isFavorite(id) ? "#EB4D4D" : "none"}
              size={20}
            />
          </button>
        </div>

        {/* Contact information section */}
        <div style={{ 
          flex: 1,
          paddingLeft: '16px',
          paddingTop: '12px'
        }}>
          {/* Hours */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ 
              fontSize: '14px',
              color: '#4b5563',
              display: 'block'
            }}>
              {hours}
            </span>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '12px' }}>
            <a 
              href={`tel:${phone}`}
              style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontSize: '14px',
                display: 'block'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {phone}
            </a>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '12px' }}>
            <a 
              href={mapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontSize: '14px',
                display: 'block'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {address}
            </a>
          </div>

          {/* Website URL */}
          {website && (
            <div style={{ marginBottom: '12px' }}>
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#2563eb', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'block',
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {website}
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Right column - All other content */}
      <div style={contentStyle}>
        {/* Restaurant name and accommodation pills container */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth <= 640 ? 'column' : 'row',
          alignItems: window.innerWidth <= 640 ? 'flex-start' : 'center',
          width: '100%',
          justifyContent: window.innerWidth <= 640 ? 'flex-start' : 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '30px' }}>{name}</h2>
          
          {/* Accommodation pills */}
          <div style={{ 
            display: 'flex', 
            gap: '4px',
            marginLeft: window.innerWidth <= 640 ? '0' : '8px',
            marginTop: window.innerWidth <= 640 ? '8px' : '0',
            flexWrap: 'wrap'
          }}>
            {hasChefAvailable && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                backgroundColor: '#ccfbf1',
                border: '1px solid #99f6e4',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: TEAL_COLOR,
                whiteSpace: 'nowrap',
                marginBottom: '4px', // Add spacing between wrapped items
                maxWidth: '100%' // Ensure it doesn't overflow
              }}>
                <ChefHat size={14} style={{ marginRight: '4px', flexShrink: 0 }} />
                Chef available
              </div>
            )}
            
            {hasAllergenMenu && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                backgroundColor: '#ccfbf1',
                border: '1px solid #99f6e4',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: TEAL_COLOR,
                whiteSpace: 'nowrap',
                marginBottom: '4px', // Add spacing between wrapped items
                maxWidth: '100%' // Ensure it doesn't overflow
              }}>
                <FileText size={14} style={{ marginRight: '4px', flexShrink: 0 }} />
                Allergen menu
              </div>
            )}
          </div>
        </div>

        {/* eatABLE Review */}
        <div style={{ marginTop: '16px' }}>
          {/* eatABLE Review */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Replace ChefHat with fork and knife emoji */}
              <span role="img" aria-label="fork and knife" style={{ fontSize: '18px' }}>
                🍴
              </span>
              
              <span style={{ 
                fontWeight: '500', 
                fontSize: '16px',
                color: '#111827'
              }}>
                eatABLE Review
              </span>
              
              {/* Star rating */}
              <div style={{ display: 'flex', marginLeft: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.round(averageEatableRating) ? "#0d9488" : "none"}
                    color="#0d9488"
                  />
                ))}
              </div>
              
              {/* Review count */}
              <span style={{ 
                color: '#6b7280', 
                fontSize: '14px',
                marginLeft: '4px' 
              }}>
                ({reviews.length})
              </span>
            </div>
            
            {/* eatABLE Review text */}
            {reviews?.length > 0 && (
              <p style={{ 
                margin: '4px 0 0 0',
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#4b5563'
              }}>
                {(() => {
                  const quote = getReviewQuote(reviews);
                  return quote ? `"${quote}"` : null;
                })()}
              </p>
            )}
          </div>
          
          {/* Google Review - keep this as is */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src={googleLogoUrl} 
                alt="Google" 
                style={{ width: '18px', height: '18px' }} 
              />
              <span style={{ 
                fontWeight: '500', 
                fontSize: '16px',
                color: '#111827'
              }}>
                Google Review
              </span>
              
              {/* Star rating */}
              <div style={{ display: 'flex', marginLeft: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= (googleReview?.rating || 4) ? "#f59e0b" : "none"}
                    color="#f59e0b"
                  />
                ))}
              </div>
              
              {/* Review count */}
              <span style={{ 
                color: '#6b7280', 
                fontSize: '14px',
                marginLeft: '4px' 
              }}>
                ({googleReview?.reviewCount || 65})
              </span>
            </div>
            
            {/* Google Review text */}
            {googleReview?.quote && (
              <p style={{ 
                margin: '4px 0 0 0',
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#4b5563'
              }}>
                "{googleReview.quote}"
              </p>
            )}
          </div>
        </div>

        {/* Allergens section - only show when there are allergen ratings */}
        {allergenRatings.length > 0 && (
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Allergies Reviewed
            </h3>
            <div style={{ 
              display: window.innerWidth <= 640 ? 'grid' : 'flex',
              ...(window.innerWidth <= 640 ? {
                gridTemplateColumns: 'repeat(2, 1fr)',
              } : {
                flexDirection: 'row',
                flexWrap: 'wrap',
              }),
              gap: '4px',
              width: '100%',
            }}>
              {allergenRatings.map((allergen, index) => {
                return (
                  <span 
                    key={index} 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      backgroundColor: '#ccfbf1',
                      border: '1px solid #99f6e4',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      color: TEAL_COLOR,
                      width: 'fit-content' // Ensures pills only take up needed space
                    }}
                  >
                    {allergen.icon && (
                      <span style={{ marginRight: '4px' }}>
                        {allergen.icon}
                      </span>
                    )}
                    {typeof allergen === 'string' ? allergen : allergen.name}
                    
                    {allergen.rating && (
                      <span 
                        style={{
                          marginLeft: '4px',
                          backgroundColor: '#0d9488',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      >
                        {allergen.rating.average}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;