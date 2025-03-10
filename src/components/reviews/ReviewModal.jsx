import { useState } from 'react';
import { Star, Info } from 'lucide-react';
import { AllergenSelector } from '../allergens/AllergenSelector.jsx';
import { useReviews } from '../../context/ReviewsContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReviewModal({ isOpen, onClose, restaurantName, restaurantId, onReviewSubmitted }) {
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [chefAvailable, setChefAvailable] = useState(null);
  const [allergenMenuAvailable, setAllergenMenuAvailable] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addReview } = useReviews();
  const { user } = useAuth();

  // Helper component for tooltip
  const InfoTooltip = ({ text, isVisible, onClose }) => (
    isVisible ? (
      <div style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '250px',
        padding: '8px 12px',
        backgroundColor: '#374151',
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px',
        zIndex: 60,
        marginTop: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            color: 'white',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ×
        </button>
        <div style={{ paddingRight: '20px' }}>
          {text}
        </div>
      </div>
    ) : null
  );

  const TooltipContainer = ({ text }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    // Handle hover for desktop
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    
    // Handle click for mobile
    const handleClick = () => setIsVisible(!isVisible);
    
    return (
      <div 
        style={{ position: 'relative' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={handleClick}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer'
          }}
        >
          <Info size={16} color="#6b7280" />
        </button>
        <InfoTooltip 
          text={text} 
          isVisible={isHovered || isVisible}
          onClose={() => setIsVisible(false)}
        />
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedAllergens.length === 0) {
      setError('Please select at least one allergen');
      return;
    }

    if (!rating) {
      setError('Please provide a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const reviewData = {
        id: crypto.randomUUID(),
        restaurantId,
        restaurantName,
        rating,
        text: reviewText,
        allergens: selectedAllergens,
        accommodations: {
          chefAvailable: chefAvailable === true,
          allergenMenu: allergenMenuAvailable === true
        },
        date: new Date().toISOString(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous'
      };

      console.log('Submitting review:', reviewData);
      await addReview(reviewData);
      
      if (onReviewSubmitted) {
        onReviewSubmitted(reviewData);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAllergen = (allergenName) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergenName)) {
        return prev.filter(a => a !== allergenName);
      }
      return [...prev, allergenName];
    });
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            border: 'none',
            background: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ×
        </button>

        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '24px',
          paddingRight: '24px'
        }}>
          Review {restaurantName}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Allergen Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Select Your Allergens *
            </label>
            <AllergenSelector 
              selectedAllergens={selectedAllergens}
              toggleAllergen={toggleAllergen}
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                {error}
              </p>
            )}
          </div>

          {/* Accommodation Questions */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '500',
              marginBottom: '16px' 
            }}>
              Were accommodations available?
            </h3>
            
            {/* Chef Available Question */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ marginRight: '8px' }}>
                  A manager/chef was available to discuss allergies
                </span>
                <TooltipContainer text="A staff member with detailed knowledge of ingredients and food preparation was available to discuss allergy concerns" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setChefAvailable(true)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${chefAvailable === true ? '#0d9488' : '#d1d5db'}`,
                    borderRadius: '6px',
                    backgroundColor: chefAvailable === true ? '#ccfbf1' : 'white',
                    color: chefAvailable === true ? '#0d9488' : '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setChefAvailable(false)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${chefAvailable === false ? '#0d9488' : '#d1d5db'}`,
                    borderRadius: '6px',
                    backgroundColor: chefAvailable === false ? '#ccfbf1' : 'white',
                    color: chefAvailable === false ? '#0d9488' : '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  No
                </button>
              </div>
            </div>

            {/* Allergen Menu Question */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ marginRight: '8px' }}>
                  An allergen menu/ingredient list was provided
                </span>
                <TooltipContainer text="A dedicated menu or detailed ingredient list that clearly identifies allergens in each dish" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAllergenMenuAvailable(true)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${allergenMenuAvailable === true ? '#0d9488' : '#d1d5db'}`,
                    borderRadius: '6px',
                    backgroundColor: allergenMenuAvailable === true ? '#ccfbf1' : 'white',
                    color: allergenMenuAvailable === true ? '#0d9488' : '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAllergenMenuAvailable(false)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${allergenMenuAvailable === false ? '#0d9488' : '#d1d5db'}`,
                    borderRadius: '6px',
                    backgroundColor: allergenMenuAvailable === false ? '#ccfbf1' : 'white',
                    color: allergenMenuAvailable === false ? '#0d9488' : '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Rate your overall experience
            </label>
            <div style={{ 
              display: 'flex',
              gap: '4px'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Star
                    size={24}
                    color={star <= (hoverRating || rating) ? '#facc15' : '#d1d5db'}
                    fill={star <= (hoverRating || rating) ? '#facc15' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Share your experience (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={1000}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                resize: 'vertical'
              }}
              placeholder="Tell others about your dining experience..."
            />
            <div style={{ 
              textAlign: 'right',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {reviewText.length}/1000
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
} 