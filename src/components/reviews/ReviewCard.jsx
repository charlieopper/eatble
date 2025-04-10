import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllergenEmoji } from '../../utils/allergenUtils';
import { useReviews } from '../../context/ReviewsContext';
import { ThumbsUp, Flag, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function ReviewCard({ review, showRestaurantName = true }) {
  const { deleteReview } = useReviews();
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const handleRestaurantClick = () => {
    const restaurantIds = {
      'Zunchi Cafe': '1',
      'Sideshow Kitchen': '2',
      'Namastey Palace': '3'
    };
    const id = restaurantIds[review.restaurantName];
    navigate(`/restaurant/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteReview(review.id, review.restaurantId);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? '#fbbf24' : '#d1d5db',
          fontSize: '20px'
        }}
      >
        ★
      </span>
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
    <div className="review-card" style={cardStyle}>
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
            {showRestaurantName ? review.restaurantName : ''}
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
          {review.allergens?.map((allergen) => {
            // Get the allergen name (either from the object or use the string directly)
            const allergenName = typeof allergen === 'object' && allergen.name ? allergen.name : allergen;
            
            return (
              <div
                key={typeof allergen === 'object' ? allergen.name : allergen}
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
                {allergenName}
              </div>
            );
          })}
        </div>

        {/* Delete button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginTop: '8px',
          gap: '8px'
        }}>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Trash2 size={16} style={{ marginRight: '4px' }} />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 