import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Phone, Globe, Clock, ChefHat, 
  FileText, Heart, ArrowLeft, Star,
  ChevronLeft, ChevronRight, ThumbsUp, Flag, Trash2
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import restaurantService from '../services/restaurantService';
import reviewService from '../services/reviewService';
import Footer from '../components/layout/Footer';
import ReviewModal from '../components/reviews/ReviewModal';
import { doc, getDoc, updateDoc, increment, arrayUnion, setDoc, collection, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import ReviewCard from '../components/reviews/ReviewCard';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/reviews/DeleteConfirmationModal';
import { useReviews } from '../context/ReviewsContext';
import { adaptGooglePlaceToMockFormat } from '../utils/placeAdapter';
import { cleanUrl } from '../utils/urlUtils';
import EatableReview from '../components/reviews/EatableReview';
import { selectMostHelpfulReview } from '../utils/reviewUtils';

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

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [restaurantReviews, setRestaurantReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [helpfulReviews, setHelpfulReviews] = useState(new Set());
  const [reportedReviews, setReportedReviews] = useState(new Set());
  const { user } = useAuth();
  const [sortOption, setSortOption] = useState('newest');
  const [sortedReviews, setSortedReviews] = useState([]);
  const [activeDeleteModal, setActiveDeleteModal] = useState(null);
  const { deleteReview } = useReviews();

  // Keep this development-only log
  if (process.env.NODE_ENV === 'development') {
    console.log('[RestaurantDetails]:', {
      action: 'load',
      restaurantId: id
    });
  }

  // Define handleDeleteReview at the component level, before any JSX
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId, id);
      setActiveDeleteModal(null);
    } catch (error) {
      console.error('Error in handleDeleteReview:', error);
    }
  };

  // Add this function at the top level of the component
  const calculateEatableReview = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return {
        rating: 0,
        reviewCount: 0,
        quote: 'No review available'
      };
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Get the highest rated review for the quote
    const bestReview = [...reviews].sort((a, b) => b.rating - a.rating)[0];
    let reviewText = bestReview.text;
    
    // Truncate review text if needed
    if (reviewText.length > 150) {
      const truncateIndex = reviewText.lastIndexOf(' ', 150);
      reviewText = truncateIndex > 0 ? reviewText.substring(0, truncateIndex) + '...' : reviewText;
    }

    return {
      rating: averageRating,
      reviewCount: reviews.length,
      quote: reviewText
    };
  };

  // Add this function near the top of the component
  const calculateReviewStats = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: {
          5: { count: 0, percentage: 0 },
          4: { count: 0, percentage: 0 },
          3: { count: 0, percentage: 0 },
          2: { count: 0, percentage: 0 },
          1: { count: 0, percentage: 0 }
        }
      };
    }

    const distribution = {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 }
    };

    // Count reviews for each rating
    reviews.forEach(review => {
      if (distribution[review.rating]) {
        distribution[review.rating].count++;
      }
    });

    // Calculate percentages
    const totalReviews = reviews.length;
    Object.keys(distribution).forEach(rating => {
      distribution[rating].percentage = 
        Math.round((distribution[rating].count / totalReviews) * 100);
    });

    // Calculate average rating
    const averageRating = Number(
      (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews)
        .toFixed(1)
    );

    return {
      averageRating,
      totalReviews,
      distribution
    };
  };

  useEffect(() => {
    const loadRestaurant = async () => {
      setIsLoading(true);
      try {
        // Get the place details from Places API
        const placeData = await restaurantService.fetchPlaceDetails(id);
        
        // Adapt the place data using our existing adapter
        const adaptedData = adaptGooglePlaceToMockFormat(placeData);
        
        // Get Eatable reviews
        const docRef = doc(db, 'restaurants', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const restaurantData = docSnap.data();
          
          if (restaurantData.reviews && restaurantData.reviews.length > 0) {
            // Use the utility function
            const mostHelpfulReview = selectMostHelpfulReview(restaurantData.reviews);
            
            if (mostHelpfulReview) {              
              // Update restaurant data with the formatted review
              adaptedData.eatableReview = mostHelpfulReview;
            }
          }
        }

        setRestaurant(adaptedData);
        
        // Set images if available from Places API
        if (placeData.photos && placeData.photos.length > 0) {
          const photoUrls = placeData.photos.map(photo => photo.getUrl());
          setImages(photoUrls);
        } else {
          setImages(MOCK_IMAGES);
        }

      } catch (error) {
        console.error('Error loading restaurant:', error);
        toast.error('Failed to load restaurant details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadRestaurant();
    }
  }, [id]);

  useEffect(() => {
    const loadRestaurantReviews = async () => {
      if (!id) {
        return;
      }
      
      setIsLoadingReviews(true);
      
      try {
        const restaurantRef = doc(db, 'restaurants', id);
        const restaurantDoc = await getDoc(restaurantRef);
        
        if (restaurantDoc.exists()) {
          const restaurantData = restaurantDoc.data();
          
          const reviews = restaurantData?.reviews || [];
          
          // Sort reviews by date (newest first)
          const sortedReviews = reviews.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          
          setRestaurantReviews(sortedReviews);
        } else {
          setRestaurantReviews([]);
        }
      } catch (error) {
        console.error('Error loading restaurant reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadRestaurantReviews();
  }, [id]);

  // Function to refresh reviews after submission
  const handleReviewSubmitted = (newReview) => {
    // Update the local reviews state immediately
    setRestaurantReviews(prevReviews => [newReview, ...prevReviews]);
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

  const handleHelpfulClick = async (reviewId) => {
    if (!user) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }

    try {
      // 1. Get the restaurant document
      const restaurantRef = doc(db, 'restaurants', reviewId);
      const restaurantDoc = await getDoc(restaurantRef);

      if (!restaurantDoc.exists()) {
        console.error('❌ Restaurant document not found');
        throw new Error('Restaurant document not found');
      }

      // 2. Get the user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      // Check if user has already marked this helpful
      const reviews = restaurantDoc.data().reviews || [];
      const targetReview = reviews.find(r => r.id === reviewId);
      const hasMarkedHelpful = targetReview?.helpfulUsers?.includes(user.uid);

      if (hasMarkedHelpful) {
        toast('You\'ve already marked this review as helpful', {
          icon: '👍',
          duration: 3000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #86efac'
          }
        });
        return;
      }

      // 3. Update the review in the restaurant document
      const updatedReviews = reviews.map(r => 
        r.id === reviewId 
          ? { 
              ...r, 
              helpfulCount: (r.helpfulCount || 0) + 1,
              helpfulUsers: [...(r.helpfulUsers || []), user.uid]
            }
          : r
      );

      await updateDoc(restaurantRef, {
        reviews: updatedReviews
      });

      // 4. Update or create user document with helpfulReviews
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          helpfulReviews: [reviewId]
        });
      } else {
        await updateDoc(userRef, {
          helpfulReviews: arrayUnion(reviewId)
        });
      }

      // 5. Update local state
      setRestaurantReviews(prev => 
        prev.map(r => 
          r.id === reviewId 
            ? { 
                ...r, 
                helpfulCount: (r.helpfulCount || 0) + 1,
                helpfulUsers: [...(r.helpfulUsers || []), user.uid]
              }
            : r
        )
      );
      
      // Update helpfulReviews Set for UI state
      setHelpfulReviews(prev => new Set([...prev, reviewId]));
      
      toast.success('Thanks for your feedback!');
    } catch (error) {
      console.error('Error updating helpful count:', error);
      toast.error('Failed to update helpful count');
    }
  };

  const handleReportClick = (reviewId) => {
    if (!reportedReviews.has(reviewId)) {
      setReportedReviews(prev => new Set([...prev, reviewId]));
      toast.success('Review has been reported to our team');
    }
  };

  // Add this effect to handle sorting when reviews or sort option changes
  useEffect(() => {
    if (!restaurantReviews) return;
    
    const sortReviews = () => {
      const reviews = [...restaurantReviews];
      
      switch (sortOption) {
        case 'newest':
          return reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        case 'highest':
          return reviews.sort((a, b) => b.rating - a.rating);
        
        case 'lowest':
          return reviews.sort((a, b) => a.rating - b.rating);
        
        case 'helpful':
          return reviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        
        default:
          return reviews;
      }
    };

    setSortedReviews(sortReviews());
  }, [restaurantReviews, sortOption]);

  // Update your sort handler
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
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

  const getAllergenData = (allergen) => {
    // Comprehensive allergen mapping with variations
    const allergenMap = {
      'Peanuts': { name: 'Peanuts', emoji: '🥜' },
      'Tree nuts': { name: 'Tree nuts', emoji: '🌰' },
      'TreeNuts': { name: 'Tree nuts', emoji: '🌰' },
      'Tree Nuts': { name: 'Tree nuts', emoji: '🌰' }, // Added this variation
      'Dairy': { name: 'Dairy', emoji: '🥛' },
      'Eggs': { name: 'Eggs', emoji: '🥚' },
      'Fish': { name: 'Fish', emoji: '🐟' },
      'Shellfish': { name: 'Shellfish', emoji: '🦐' },
      'Soy': { name: 'Soy', emoji: '🫘' },
      'Wheat': { name: 'Wheat', emoji: '🌾' },
      'Sesame': { name: 'Sesame', emoji: '🌱' },
      'Gluten': { name: 'Gluten', emoji: '🍞' }
    };

    // Normalize the allergen string to handle case and spacing variations
    const normalizedAllergen = allergen.trim();
    return allergenMap[normalizedAllergen] || { name: allergen, emoji: '⚠️' };
  };

  const reviewStats = calculateReviewStats(restaurantReviews);

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

        {/* eatABLE Review */}
        <EatableReview review={restaurant.eatableReview} />

        {/* Google Review */}
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <img 
              src={googleLogoUrl} 
              alt="Google" 
              style={{ width: '16px', height: '16px', marginRight: '8px' }}
            />
            <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '8px' }}>Google Review</span>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => {
                const rating = restaurant?.googleReview?.rating || 0;
                const isFullStar = i < Math.floor(rating);
                const isHalfStar = !isFullStar && i === Math.floor(rating) && rating % 1 >= 0.5;
                
                return (
                  <Star
                    key={i}
                    size={12}
                    color="#facc15"
                    fill={isFullStar ? "#facc15" : isHalfStar ? "url(#halfStar)" : "none"}
                  />
                );
              })}
              {/* SVG definition for half star */}
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="halfStar">
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="#d1d5db" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
              ({restaurant?.googleReview?.reviewCount || 0})
            </span>
          </div>
          <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#4b5563', margin: '0' }}>
            "{restaurant?.googleReview?.quote || 'No review available'}"
          </p>
        </div>

        {/* Allergens - with updated heading */}
        {restaurant.allergens && restaurant.allergens.length > 0 && (
          <div style={{ 
            borderTop: '1px solid #e5e7eb',
            paddingTop: '12px',
            marginBottom: '16px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Allergies Reviewed
            </h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px'
            }}>
              {restaurant.allergens.map((allergen, index) => (
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
                    marginBottom: '4px',
                    position: 'relative'
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
                        width: '20px',
                        height: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                      title={`Average rating: ${allergen.rating.average} from ${allergen.rating.count} review${allergen.rating.count !== 1 ? 's' : ''}`}
                    >
                      {allergen.rating.average}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div style={{ 
          padding: '12px 0', 
          borderTop: '1px solid #e5e7eb',
          marginBottom: '12px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#4b5563',
            marginBottom: '8px'
          }}>
            {restaurant.hours || 'Hours not available'}
          </div>
          
          <a 
            href={`tel:${restaurant.phone}`} 
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontSize: '14px',
              display: 'block',
              marginBottom: '8px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {restaurant.phone || 'Phone not available'}
          </a>
          
          <a 
            href={mapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontSize: '14px',
              display: 'block',
              marginBottom: '8px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {restaurant.address || 'Address not available'}
          </a>
          
          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#2563eb',
                textDecoration: 'none'
              }}
            >
              {cleanUrl(restaurant.website)}
            </a>
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
                    marginRight: '8px'
                  }}>
                    <div style={{
                      width: `${reviewStats.distribution[stars].percentage}%`,
                      height: '100%',
                      backgroundColor: '#facc15',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{ width: '30px', fontSize: '14px', color: '#6b7280' }}>
                    {reviewStats.distribution[stars].percentage}%
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right side - Average rating */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex' }}>
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
                {reviewStats.averageRating}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {reviewStats.totalReviews} reviews
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
              value={sortOption}
              onChange={handleSortChange}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '14px',
                color: '#4b5563'
              }}
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
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
          {isLoadingReviews ? (
            <div>Loading reviews...</div>
          ) : sortedReviews.length > 0 ? (
            <div className="reviews-list">
              {sortedReviews.map((review) => {
                const isMatch = user?.uid === review.userId;

                return (
                  <div 
                    key={review.id}
                    style={{
                      padding: '20px',
                      borderBottom: '1px solid #e5e7eb',
                      position: 'relative'
                    }}
                  >
                    {/* Header with user info and date */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            fontSize: '16px',
                            color: '#4b5563'
                          }}
                        >
                          {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{review.userName}</div>
                          {/* Star Rating */}
                          <div style={{ display: 'flex', marginTop: '4px', marginBottom: '8px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < review.rating ? "#facc15" : "none"}
                                color={i < review.rating ? "#facc15" : "#d1d5db"}
                              />
                            ))}
                          </div>
                          {/* Allergens - now under star rating */}
                          {review.allergens && review.allergens.length > 0 && (
                            <div style={{ 
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              {review.allergens.map((allergen, index) => {
                                const allergenInfo = getAllergenData(allergen);
                                return (
                                  <span
                                    key={index}
                                    style={{
                                      padding: '2px 8px',
                                      backgroundColor: '#ecfdf5',
                                      color: '#065f46',
                                      borderRadius: '9999px',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span>{allergenInfo.emoji}</span>
                                    <span>{allergenInfo.name}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#6b7280',
                        whiteSpace: 'nowrap'
                      }}>
                        {new Date(review.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Review text */}
                    <p style={{ 
                      fontSize: '15px',
                      lineHeight: '1.5',
                      color: '#374151',
                      marginBottom: '16px'
                    }}>
                      {review.text}
                    </p>

                    {/* Review actions - modernized buttons */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px'
                    }}>
                      <button
                        onClick={() => handleHelpfulClick(review.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: review.helpfulUsers?.includes(user?.uid) ? '#f0fdf4' : '#f9fafb',
                          border: '1px solid',
                          borderColor: review.helpfulUsers?.includes(user?.uid) ? '#86efac' : '#e5e7eb',
                          color: review.helpfulUsers?.includes(user?.uid) ? '#15803d' : '#6b7280',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          fontWeight: '500'
                        }}
                      >
                        <ThumbsUp 
                          size={16} 
                          style={{ 
                            marginRight: '4px',
                            fill: review.helpfulUsers?.includes(user?.uid) ? '#15803d' : 'none'
                          }} 
                        />
                        Helpful ({review.helpfulCount || 0})
                      </button>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {user?.uid === review.userId && (
                          <button
                            onClick={() => setActiveDeleteModal(review.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              fontWeight: '500'
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() => handleReportClick(review.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: reportedReviews.has(review.id) ? '#fef2f2' : '#f9fafb',
                            border: '1px solid',
                            borderColor: reportedReviews.has(review.id) ? '#fecaca' : '#e5e7eb',
                            color: reportedReviews.has(review.id) ? '#dc2626' : '#6b7280',
                            fontSize: '14px',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                            fontWeight: '500'
                          }}
                        >
                          <Flag 
                            size={16} 
                            style={{ 
                              marginRight: '4px',
                              fill: reportedReviews.has(review.id) ? '#dc2626' : 'none'
                            }} 
                          />
                          Report
                        </button>
                      </div>
                    </div>

                    {/* Delete confirmation modal for this specific review */}
                    <DeleteConfirmationModal
                      isOpen={activeDeleteModal === review.id}
                      onClose={() => setActiveDeleteModal(null)}
                      onConfirm={() => {
                        handleDeleteReview(review.id);
                        setActiveDeleteModal(null);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No reviews yet</p>
          )}
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