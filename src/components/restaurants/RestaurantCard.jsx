import React, { useState } from 'react';
import { Heart, Star, ChefHat, FileText } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

// Placeholder restaurant image URL
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fHww&w=1000&q=80";

const RestaurantCard = ({ restaurant, onClick }) => {
  const { name, image, cuisines, eatableReview, accommodations } = restaurant;
  const { isFavorite, toggleFavorite } = useFavorites();

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
    flexDirection: 'row'
  };

  const cardHoverStyle = {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#f9fafb'
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
    color: '#16a34a',
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
    color: '#4b5563'
  };

  const allergenTagStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #d1fae5',
    borderRadius: '9999px',
    fontSize: '12px',
    color: '#059669',
    marginRight: '4px',
    marginBottom: '4px'
  };
  
  // Handle mouse events for hover effect
  const handleMouseEnter = (e) => {
    Object.assign(e.currentTarget.style, cardHoverStyle);
  };
  
  const handleMouseLeave = (e) => {
    Object.assign(e.currentTarget.style, cardStyle);
  };

  return (
    <div style={cardStyle}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    onClick={() => onClick && onClick(restaurant)}
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
            <div style={accommodationStyle}>
              <ChefHat size={16} style={{ marginRight: '4px' }} />
              <span>Chef available</span>
            </div>
          )}
          {accommodations?.allergenMenu && (
            <div style={accommodationStyle}>
              <FileText size={16} style={{ marginRight: '4px' }} />
              <span>Allergen menu</span>
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
                  color={i < Math.floor(eatableReview?.rating || 0) ? "#22c55e" : "#d1d5db"}
                  fill={i < Math.floor(eatableReview?.rating || 0) ? "#22c55e" : "none"}
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
            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>G</span>
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
            {allergens.map((allergen, index) => (
              <span key={index} style={allergenTagStyle}>
                {allergen.icon && <span style={{ marginRight: '4px' }}>{allergen.icon}</span>}
                {typeof allergen === 'string' ? allergen : allergen.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;