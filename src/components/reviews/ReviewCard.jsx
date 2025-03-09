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

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={contentStyle}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRestaurantClick();
              }}
              className="text-xl font-semibold text-gray-900 hover:text-gray-700 cursor-pointer"
            >
              {review.restaurantName}
            </div>
            <div className="flex mt-2 mb-3">
              {renderStars(review.rating)}
            </div>
          </div>
          <span className="text-gray-500 text-sm">
            {new Date(review.date).toLocaleDateString()}
          </span>
        </div>

        <p className="text-gray-700 text-lg mb-4 leading-relaxed">
          {review.text}
        </p>

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