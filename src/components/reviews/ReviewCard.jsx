import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllergenEmoji } from '../../utils/allergenUtils';

export default function ReviewCard({ review }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Add console log to debug review object
  console.log('Review object:', review);

  const handleRestaurantClick = () => {
    const restaurantIds = {
      'Zunchi Cafe': '1',
      'Sideshow Kitchen': '2',
      'Namastey Palace': '3'
    };
    const id = restaurantIds[review.restaurantName];
    navigate(`/restaurant/${id}`);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={24}
        className={`w-6 h-6 ${
          index < rating 
            ? "text-yellow-400 fill-yellow-400" 
            : "text-gray-200"
        }`}
      />
    ));
  };

  const getAllergenData = (allergen) => {
    // If allergen is already an object with name property, return it
    if (typeof allergen === 'object' && allergen.name) {
      return allergen;
    }

    // Comprehensive allergen mapping matching homepage
    const allergenMap = {
      'Peanuts': { name: 'Peanuts', emoji: '🥜' },
      'Tree nuts': { name: 'Tree nuts', emoji: '🌰' },
      'Dairy': { name: 'Dairy', emoji: '🥛' },
      'Eggs': { name: 'Eggs', emoji: '🥚' },
      'Fish': { name: 'Fish', emoji: '🐟' },
      'Shellfish': { name: 'Shellfish', emoji: '🦐' },
      'Soy': { name: 'Soy', emoji: '🫘' },
      'Wheat': { name: 'Wheat', emoji: '🌾' },
      'Sesame': { name: 'Sesame', emoji: '🌱' },
      'Gluten': { name: 'Gluten', emoji: '🍞' }
    };

    return allergenMap[allergen] || { name: allergen, emoji: getAllergenEmoji(allergen) };
  };

  const cardStyle = {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden',
    boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
  };

  const contentStyle = {
    padding: '16px',
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div style={cardStyle}>
      <div style={contentStyle}>
        {/* Header with restaurant name and date */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <h3 
            onClick={handleRestaurantClick}
            style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0',
              cursor: 'pointer',
              color: isHovered ? '#0d9488' : 'inherit'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {review.restaurantName}
          </h3>
          <span style={{ 
            fontSize: '14px',
            color: '#666666'
          }}>
            {formatDate(review.date)}
          </span>
        </div>

        {/* Stars */}
        <div style={{ 
          display: 'flex',
          marginBottom: '12px'
        }}>
          {renderStars(review.rating)}
        </div>

        {/* Review text */}
        <p style={{ 
          margin: '0 0 12px 0',
          lineHeight: '1.5'
        }}>
          {review.text}
        </p>

        {/* Allergens */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center'
        }}>
          {review.allergens?.map((allergen) => (
            <div
              key={allergen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                backgroundColor: '#ccfbf1',
                border: '1px solid #99f6e4',
                borderRadius: '9999px',
                fontSize: '11px',
                color: '#0d9488',
                height: '22px',
                lineHeight: '18px'
              }}
            >
              <span style={{ 
                marginRight: '4px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {getAllergenEmoji(allergen)}
              </span>
              {allergen}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 