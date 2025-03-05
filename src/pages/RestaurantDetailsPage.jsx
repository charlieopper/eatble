import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Phone, Globe, Clock, ChefHat, 
  FileText, Heart, ArrowLeft, Star,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import restaurantService from '../services/restaurantService';
import reviewService from '../services/reviewService';
import Footer from '../components/layout/Footer';
import ReviewModal from '../components/reviews/ReviewModal';

// Placeholder restaurant image URL
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fHww&w=1000&q=80";

// Mock images for carousel (in a real app, these would come from the API)
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fHww&w=1000&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D&w=1000&q=80"
];

// Use teal color for allergen indicators, chef available, and eatABLE stars
const TEAL_COLOR = "#0d9488";

// Add this at the top of the file with other imports
const googleLogoUrl = "https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png";

// Review component to handle individual reviews
const ReviewItem = ({ review }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  
  return (
    <div 
      key={review.id}
      style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '16px',
        backgroundColor: review.isUserReview ? '#f9fafb' : 'transparent'
      }}
    >
      {/* User info and rating */}
      <div style={{
        display: 'flex',
        marginBottom: '12px'
      }}>
        <img 
          src={review.user.image} 
          alt={review.user.name}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            marginRight: '12px'
          }}
        />
        <div>
          <div style={{ 
            fontWeight: '500', 
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {review.user.name}
            {review.isUserReview && (
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '9999px'
              }}>
                Your Review
              </span>
            )}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < review.rating ? "#facc15" : "#d1d5db"}
                fill={i < review.rating ? "#facc15" : "none"}
              />
            ))}
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              marginLeft: '8px'
            }}>
              {review.date}
            </span>
          </div>
          
          {/* Allergens */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            marginBottom: '8px'
          }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              marginRight: '8px'
            }}>
              Allergies:
            </span>
            {review.allergens.map((allergen, index) => (
              <span 
                key={index}
                style={{ 
                  display: 'inline-block',
                  padding: '2px 6px',
                  backgroundColor: '#ccfbf1',
                  border: '1px solid #99f6e4',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  color: "#0d9488",
                  marginRight: '4px'
                }}
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Review text */}
      <p style={{ 
        fontSize: '14px', 
        lineHeight: '1.5',
        color: '#4b5563',
        marginBottom: '12px'
      }}>
        {review.text}
      </p>
      
      {/* Review actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          style={{
            backgroundColor: isHelpful ? '#f3f4f6' : 'transparent',
            border: 'none',
            fontSize: '12px',
            color: isHelpful ? '#0d9488' : '#6b7280',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            if (!isHelpful) {
              setHelpfulCount(prev => prev + 1);
              setIsHelpful(true);
              // In a real app, this would call an API to mark the review as helpful
            }
          }}
        >
          <span 
            role="img" 
            aria-label="thumbs up" 
            style={{ 
              transform: isHelpful ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          >
            👍
          </span>
          Helpful ({helpfulCount})
        </button>
        <button
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '12px',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          Report this review
        </button>
      </div>
    </div>
  );
};

// Reviews list component
const EatableReviewsList = ({ reviews }) => {
  return (
    <>
      {reviews.map(review => (
        <ReviewItem key={review.id} review={review} />
      ))}
      
      {/* Load More Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginTop: '16px'
      }}>
        <button
          style={{
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '14px',
            color: '#4b5563',
            cursor: 'pointer'
          }}
        >
          Load more reviews
        </button>
      </div>
    </>
  );
};

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userReviews, setUserReviews] = useState([]);

  useEffect(() => {
    const loadRestaurant = async () => {
      setIsLoading(true);
      try {
        const data = await restaurantService.getRestaurantById(id);
        setRestaurant(data);
        
        // In a real app, we would get images from the API
        // For now, we'll use our mock images
        setImages(MOCK_IMAGES);
      } catch (error) {
        console.error('Error loading restaurant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurant();
  }, [id]);

  // Fetch user reviews
  useEffect(() => {
    const fetchUserReviews = () => {
      const allReviews = reviewService.getUserReviews();
      // Filter reviews for this restaurant
      const restaurantReviews = allReviews.filter(review => review.restaurantId === id);
      setUserReviews(restaurantReviews);
    };
    
    fetchUserReviews();
  }, [id]);

  // Function to refresh reviews after submission
  const handleReviewSubmitted = () => {
    const allReviews = reviewService.getUserReviews();
    const restaurantReviews = allReviews.filter(review => review.restaurantId === id);
    setUserReviews(restaurantReviews);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(0, 0, 0, 0.1)', 
          borderLeftColor: '#3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: '#f9fafb'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px' 
        }}>
          Restaurant not found
        </h2>
        <Link 
          to="/restaurants" 
          style={{ 
            color: '#3b82f6', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={20} />
          Back to restaurants
        </Link>
      </div>
    );
  }

  // Create map URL for the address
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(restaurant.address || '')}`;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      paddingBottom: '80px' // Space for footer
    }}>
      {/* Header */}
      {/* <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          height: '64px' 
        }}>
          <Link 
            to="/restaurants" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#4b5563', 
              textDecoration: 'none' 
            }}
          >
            <ArrowLeft style={{ marginRight: '8px' }} size={20} />
            Back
          </Link>
        </div>
      </div> */}

      {/* Main Content */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginTop: '24px'
      }}>
        {/* Back Button */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px' 
        }}>
          <Link 
            to="/restaurants" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              color: '#4b5563', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft style={{ marginRight: '4px' }} size={16} />
            Back to restaurants
          </Link>
          <button 
            onClick={() => toggleFavorite(restaurant)}
            style={{ 
              padding: '8px', 
              borderRadius: '9999px', 
              border: 'none', 
              background: 'transparent', 
              cursor: 'pointer' 
            }}
          >
            <Heart 
              size={20} 
              color={isFavorite(restaurant.id) ? "#ef4444" : "#9ca3af"}
              fill={isFavorite(restaurant.id) ? "#ef4444" : "none"}
            />
          </button>
        </div>
        
        {/* Image Carousel */}
        <div style={{ 
          position: 'relative',
          marginBottom: '16px'
        }}>
          <img
            src={images[currentImageIndex] || PLACEHOLDER_IMAGE}
            alt={`${restaurant.name} - image ${currentImageIndex + 1}`}
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMAGE;
              e.target.onerror = null;
            }}
          />
          
          {/* Carousel Navigation */}
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Image Indicators */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'center',
                gap: '6px'
              }}>
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      border: 'none',
                      padding: '0',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Restaurant Name and Cuisines - Side by Side */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                marginRight: '8px',
                marginBottom: '0'
              }}>
                {restaurant.name}
              </h1>
              {restaurant.cuisines?.map((cuisine, index) => (
                <span 
                  key={index}
                  style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    marginBottom: '4px',
                    display: 'inline-block'
                  }}
                >
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            <span style={{ marginRight: '6px' }}>✏️</span>
            Add review
          </button>
        </div>

        {/* eatABLE Review */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{ marginRight: '8px' }}>🍴</span>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '14px', 
              marginRight: '8px' 
            }}>
              eatABLE Rating
            </span>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  color={i < Math.floor(restaurant.eatableReview?.rating || 0) ? TEAL_COLOR : "#d1d5db"}
                  fill={i < Math.floor(restaurant.eatableReview?.rating || 0) ? TEAL_COLOR : "none"}
                />
              ))}
            </div>
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginLeft: '8px' 
            }}>
              ({restaurant.eatableReview?.reviewCount || 0})
            </span>
          </div>
          <p style={{ 
            fontSize: '14px', 
            fontStyle: 'italic', 
            color: '#4b5563',
            margin: '0'
          }}>
            "{restaurant.eatableReview?.quote || 'No review available'}"
          </p>
        </div>

        {/* Google Review */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <img 
              src={googleLogoUrl}
              alt="Google" 
              className="google-g-logo" 
              width="18" 
              height="18" 
              style={{ marginRight: '8px' }}
            />
            <span style={{ 
              fontWeight: '600', 
              fontSize: '14px', 
              marginRight: '8px' 
            }}>
              Google Review
            </span>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  color={i < Math.floor(restaurant.googleReview?.rating || 0) ? "#facc15" : "#d1d5db"}
                  fill={i < Math.floor(restaurant.googleReview?.rating || 0) ? "#facc15" : "none"}
                />
              ))}
            </div>
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginLeft: '8px' 
            }}>
              ({restaurant.googleReview?.reviewCount || 0})
            </span>
          </div>
          <p style={{ 
            fontSize: '14px', 
            fontStyle: 'italic', 
            color: '#4b5563',
            margin: '0'
          }}>
            "{restaurant.googleReview?.quote || 'No review available'}"
          </p>
        </div>

        {/* Restaurant Details */}
        {/* Allergies Reviewed */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            Allergies Reviewed
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {restaurant.allergens?.map(allergen => (
              <div 
                key={allergen.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f0fdfa',
                  border: `1px solid ${TEAL_COLOR}`,
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  fontSize: '14px'
                }}
              >
                <span style={{ marginRight: '4px' }}>{allergen.emoji}</span>
                <span>{allergen.name}</span>
                <span style={{ 
                  marginLeft: '6px',
                  backgroundColor: TEAL_COLOR,
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {allergen.count}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Clock size={18} style={{ marginRight: '12px', color: '#6b7280' }} />
              <span>Open until 11PM Fri</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Phone size={18} style={{ marginRight: '12px', color: '#6b7280' }} />
              <a 
                href={`tel:${restaurant.phone}`}
                style={{ color: '#2563eb', textDecoration: 'none' }}
              >
                (415) 552-2622
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <MapPin size={18} style={{ marginRight: '12px', color: '#6b7280' }} />
              <a 
                href={`https://maps.google.com/?q=${restaurant.address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none' }}
              >
                123 Main St, San Francisco, CA 94105
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Globe size={18} style={{ marginRight: '12px', color: '#6b7280' }} />
              <a 
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none' }}
              >
                zunchicafe.com
              </a>
            </div>
          </div>
        </div>

        {/* Accommodations */}
        <div style={{ 
          display: 'flex', 
          marginTop: '12px', 
          marginBottom: '16px' 
        }}>
          {restaurant.accommodations?.chefAvailable && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '14px', 
              color: TEAL_COLOR, 
              marginRight: '12px',
              position: 'relative',
              cursor: 'help'
            }}
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
          {restaurant.accommodations?.allergenMenu && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '14px', 
              color: TEAL_COLOR, 
              marginRight: '12px',
              position: 'relative',
              cursor: 'help'
            }}
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

        {/* Detailed eatABLE Reviews Section */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            eatABLE Reviews
          </h3>
          
          {/* Rating Summary */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '40px',
            marginBottom: '20px'
          }}>
            {/* Left side - Rating distribution */}
            <div style={{ width: '60%', maxWidth: '400px' }}>
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '80px'
                  }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        color={i < stars ? "#facc15" : "#d1d5db"}
                        fill={i < stars ? "#facc15" : "none"}
                      />
                    ))}
                  </div>
                  <div style={{ 
                    width: 'calc(100% - 110px)', 
                    height: '8px', 
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    marginLeft: '8px',
                    marginRight: '8px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: stars === 5 ? '85%' : 
                             stars === 4 ? '7%' : 
                             stars === 3 ? '5%' : 
                             stars === 2 ? '2%' : '1%',
                      backgroundColor: '#facc15',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    width: '30px',
                    textAlign: 'right'
                  }}>
                    {stars === 5 ? '85%' : 
                     stars === 4 ? '7%' : 
                     stars === 3 ? '5%' : 
                     stars === 2 ? '2%' : '1%'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Right side - Overall rating */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>Rating</div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    color="#facc15"
                    fill="#facc15"
                  />
                ))}
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                4.9
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                129 reviews
              </div>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <select 
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '14px',
                color: '#4b5563'
              }}
            >
              <option>Newest</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
              <option>Most Helpful</option>
            </select>
            
            <div style={{
              position: 'relative',
              width: '220px'
            }}>
              <input
                type="text"
                placeholder="Search in reviews"
                style={{
                  padding: '8px 12px',
                  paddingRight: '32px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
              <div style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}>
                🔍
              </div>
            </div>
          </div>
          
          {/* Individual Reviews */}
          <EatableReviewsList reviews={[
            {
              id: 1,
              user: { name: 'Karen Armstrong', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
              rating: 5,
              date: '2 months ago',
              allergens: ['Peanuts', 'Tree nuts'],
              text: 'Love this place! Great ambiance, plenty of outdoor seating, and the chef was fantastic. We mentioned my son\'s life-threatening peanut and tree nut allergy. When we arrived, Marcus, the chef, came to our table and walked us through the menu. He was able to prepare a safe and special pepperoni pizza for my son (which he loved) and was able to make him a nut-free dessert with Breyer\'s ice cream. Highly recommend if you\'re in SF!',
              helpfulCount: 12
            },
            {
              id: 2,
              user: { name: 'Dan Sargent', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
              rating: 4,
              date: '3 months ago',
              allergens: ['Shellfish'],
              text: 'This is an all-time great SF restaurant! Stopped by after a Warriors game and had the best pizza I\'ve ever had. Special shout-out to Marcus who was very attentive to my shellfish allergy.',
              helpfulCount: 5
            },
            ...userReviews.map(review => ({
              id: review.id,
              user: { name: 'You', image: 'https://randomuser.me/api/portraits/lego/1.jpg' },
              rating: review.rating,
              date: 'Just now',
              allergens: review.allergens,
              text: review.reviewText,
              helpfulCount: 0,
              isUserReview: true // Flag to identify user's own reviews
            }))
          ]} />
        </div>
      </div>

      <Footer activePage="Search" />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        restaurantName={restaurant?.name}
        restaurantId={id}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
} 