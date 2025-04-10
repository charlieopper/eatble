import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, query, limit, orderBy, setDoc, collection, getDocs, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { calculateAllergenRatings, formatAllergenRatings } from '../utils/allergens';

// Create context
export const ReviewsContext = createContext();

// Custom hook
export const useReviews = () => {
  return useContext(ReviewsContext);
};

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  
  const REVIEWS_PER_PAGE = 10;

  // Load reviews with pagination
  useEffect(() => {
    const loadReviews = async () => {
      if (!user) {
        setReviews([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userReviews = userDoc.data()?.reviews || [];
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
        const endIndex = startIndex + REVIEWS_PER_PAGE;
        const paginatedReviews = userReviews.slice(startIndex, endIndex);

        setReviews(paginatedReviews);
        setHasMore(endIndex < userReviews.length);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setError('Failed to load reviews');
        toast.error('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [user, currentPage]);

  const updateRestaurantAllergenRatings = async (restaurantId) => {
    try {
      console.debug('🔄 Updating allergen ratings for restaurant:', restaurantId);
      
      // Get all reviews for this restaurant
      const restaurantReviews = reviews.filter(review => review.restaurantId === restaurantId);
      
      if (restaurantReviews.length > 0) {
        // Calculate new allergen ratings
        const newRatings = calculateAllergenRatings(restaurantReviews);
        const formattedRatings = formatAllergenRatings(newRatings);
        
        console.debug('✅ New allergen ratings calculated:', formattedRatings);
        
        // Update the restaurant in your database with new allergen ratings
        // This depends on your database structure and API
        await updateRestaurantAllergens(restaurantId, formattedRatings);
      }
    } catch (error) {
      console.error('Error updating allergen ratings:', error);
    }
  };

  const addReview = async (reviewData) => {
    if (!user) {
      toast.error('Please login to submit reviews');
      return;
    }

    try {
      console.group('📝 Review Addition Process');
      console.log('Attempting to add review:', reviewData);

      const restaurantRef = doc(db, 'restaurants', reviewData.restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      // Add log to show current Firestore data
      console.log('Current Firestore restaurant data:', restaurantDoc.data());

      if (!restaurantDoc.exists()) {
        console.log('Creating new restaurant document');
        await setDoc(restaurantRef, {
          id: reviewData.restaurantId,
          name: reviewData.restaurantName,
          reviews: [reviewData]
        });
        // Verify creation
        const verifyNew = await getDoc(restaurantRef);
        console.log('Verified new restaurant document:', verifyNew.data());
      } else {
        console.log('Updating existing restaurant:', {
          id: restaurantDoc.id,
          currentReviews: restaurantDoc.data()?.reviews?.length || 0
        });
        
        await updateDoc(restaurantRef, {
          reviews: arrayUnion(reviewData)
        });
        // Verify update
        const verifyUpdate = await getDoc(restaurantRef);
        console.log('Verified updated restaurant document:', {
          totalReviews: verifyUpdate.data()?.reviews?.length,
          latestReview: verifyUpdate.data()?.reviews?.slice(-1)[0]
        });
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('Creating new user document');
        await setDoc(userRef, {
          uid: user.uid,
          reviews: [reviewData]
        });
      } else {
        console.log('Updating existing user document');
        await updateDoc(userRef, {
          reviews: arrayUnion(reviewData)
        });
      }

      setReviews(prev => [reviewData, ...prev]);
      console.log('Review addition completed successfully');
      console.groupEnd();
      
      // Update allergen ratings for this restaurant
      await updateRestaurantAllergenRatings(reviewData.restaurantId);
      
      return reviewData;
    } catch (error) {
      console.error('Error in addReview:', error);
      console.groupEnd();
      throw error;
    }
  };

  const loadMoreReviews = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Add sorting options
  const sortReviews = (reviews, sortBy = 'newest') => {
    switch (sortBy) {
      case 'mostHelpful':
        return [...reviews].sort((a, b) => 
          (b.helpfulCount || 0) - (a.helpfulCount || 0)
        );
      case 'newest':
        return [...reviews].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
      default:
        return reviews;
    }
  };

  // Update the fetch reviews function
  const fetchReviews = async (restaurantId, sortBy = 'newest') => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('restaurantId', '==', restaurantId),
      orderBy(sortBy === 'mostHelpful' ? 'helpfulCount' : 'date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const deleteReview = async (reviewId, restaurantId) => {
    if (!user) {
      toast.error('Please login to delete reviews');
      return;
    }

    try {
      // 1. Get current restaurant data
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (!restaurantDoc.exists()) {
        throw new Error('Restaurant not found');
      }

      // 2. Find and remove the review
      const currentReviews = restaurantDoc.data().reviews || [];
      const reviewToDelete = currentReviews.find(r => r.id === reviewId);

      if (!reviewToDelete) {
        throw new Error('Review not found');
      }

      // Security check
      if (reviewToDelete.userId !== user.uid) {
        throw new Error('Unauthorized: You can only delete your own reviews');
      }

      // 3. Remove review from restaurant document
      const updatedReviews = currentReviews.filter(r => r.id !== reviewId);
      await updateDoc(restaurantRef, {
        reviews: updatedReviews
      });

      // 4. Remove review from user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userReviews = userDoc.data()?.reviews || [];
      const updatedUserReviews = userReviews.filter(r => r.id !== reviewId);
      
      await updateDoc(userRef, {
        reviews: updatedUserReviews
      });

      // 5. Update local state
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete review');
      throw error;
    }
  };

  return (
    <ReviewsContext.Provider value={{
      reviews,
      isLoading,
      error,
      hasMore,
      addReview,
      loadMoreReviews,
      deleteReview
    }}>
      {children}
    </ReviewsContext.Provider>
  );
}; 