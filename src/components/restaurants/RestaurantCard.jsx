import React, { useState } from 'react';
import { Heart, Star, ChefHat, FileText } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';

// Placeholder restaurant image URL
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fHww&w=1000&q=80";

// Use teal color for allergen indicators, chef available, and eatABLE stars
const TEAL_COLOR = "#0d9488";

// With this URL that points to the Google "G" icon
const googleLogoUrl = "https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png";

const RestaurantCard = ({ restaurant, onClick }) => {
  const { name, image, cuisines, eatableReview, accommodations } = restaurant;
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

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
    allergens = [],
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

  // Add this console log at the top of your component to debug
  console.log("Google logo path:", googleLogoUrl);

  // Add this near the top of your component
  console.log("Restaurant allergens:", allergens);

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
              e.target.onerror = null;
            }}
          />
        </div>
        
        {/* Hours, Contact and Address relocated here */}
        <div style={{
          padding: '12px',
          fontSize: '14px',
          color: '#4b5563'
        }}>
          <div>{hours}</div>
          <a 
            href={`tel:${phone}`} 
            style={{ color: '#2563eb', textDecoration: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {phone}
          </a>
          <div style={{ marginTop: '4px' }}>
            <a 
              href={mapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {address}
            </a>
          </div>
        </div>
      </div>
      
      {/* Right column - All other content */}
      <div style={contentStyle}>
        <div style={headerStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <h3 style={{ ...titleStyle, marginRight: '8px', marginBottom: '0' }}>{name}</h3>
              {cuisines.map((cuisine, index) => (
                <span key={index} style={cuisineTagStyle}>
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
          
          {/* Favorite Button */}
          <button 
            style={btnStyle}
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

        {/* Accommodations */}
        <div style={{ display: 'flex', marginTop: '12px', marginBottom: '8px' }}>
          {accommodations?.chefAvailable && (
            <div 
              style={{...accommodationStyle, position: 'relative'}}
              onMouseEnter={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) tooltip.style.display = 'block';
              }}
              onMouseLeave={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) tooltip.style.display = 'none';
              }}
            >
              <ChefHat size={16} style={{ marginRight: '4px' }} />
              <span>Chef available</span>
              <div 
                className="tooltip"
                style={{
                  display: 'none',
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#27272a',
                  color: 'white',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  marginBottom: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                One or more users has reported chef availability
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #27272a'
                }}></div>
              </div>
            </div>
          )}
          {accommodations?.allergenMenu && (
            <div 
              style={{...accommodationStyle, position: 'relative'}}
              onMouseEnter={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) tooltip.style.display = 'block';
              }}
              onMouseLeave={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) tooltip.style.display = 'none';
              }}
            >
              <FileText size={16} style={{ marginRight: '4px' }} />
              <span>Allergen menu</span>
              <div 
                className="tooltip"
                style={{
                  display: 'none',
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#27272a',
                  color: 'white',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  marginBottom: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                One or more users has reported an allergen menu
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #27272a'
                }}></div>
              </div>
            </div>
          )}
        </div>

        {/* eatABLE Review */}
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <div style={reviewHeaderStyle}>
            <span style={{ marginRight: '8px' }}>🍴</span>
            <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '8px' }}>eatABLE Review</span>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  color={i < Math.floor(eatableReview?.rating || 0) ? TEAL_COLOR : "#d1d5db"}
                  fill={i < Math.floor(eatableReview?.rating || 0) ? TEAL_COLOR : "none"}
                />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
              ({eatableReview?.reviewCount || 0})
            </span>
          </div>
          <p style={quoteStyle}>"{eatableReview?.quote || 'No review available'}"</p>
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
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  color={i < Math.floor(googleReview?.rating || 0) ? "#facc15" : "#d1d5db"}
                  fill={i < Math.floor(googleReview?.rating || 0) ? "#facc15" : "none"}
                />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
              ({googleReview?.reviewCount || 0})
            </span>
          </div>
          <p style={quoteStyle}>"{googleReview?.quote || 'No review available'}"</p>
        </div>

        {/* Allergens */}
        {allergens && allergens.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
            {allergens.map((allergen, index) => {
              console.log("Allergen item:", allergen);
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
                    marginRight: '4px',
                    marginBottom: '4px'
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
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;