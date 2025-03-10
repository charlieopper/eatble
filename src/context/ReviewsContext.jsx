import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, query, limit, orderBy, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

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
        console.log('Fetching reviews for user:', user.uid);
        console.log('Current page:', currentPage);
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userReviews = userDoc.data()?.reviews || [];
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
        const endIndex = startIndex + REVIEWS_PER_PAGE;
        const paginatedReviews = userReviews.slice(startIndex, endIndex);
        
        console.log('Fetched reviews:', {
          total: userReviews.length,
          current: paginatedReviews.length,
          hasMore: endIndex < userReviews.length
        });

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

  const addReview = async (reviewData) => {
    if (!user) {
      toast.error('Please login to submit reviews');
      return;
    }

    try {
      console.log('Starting review save process...');
      
      // Check and create/update restaurant document
      const restaurantRef = doc(db, 'restaurants', reviewData.restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (!restaurantDoc.exists()) {
        console.log('Creating new restaurant document');
        await setDoc(restaurantRef, {
          id: reviewData.restaurantId,
          name: reviewData.restaurantName,
          reviews: [reviewData]
        });
      } else {
        console.log('Updating existing restaurant document');
        await updateDoc(restaurantRef, {
          reviews: arrayUnion(reviewData)
        });
      }
      console.log('Saved to restaurant document');

      // Check and create/update user document
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
      console.log('Saved to user document');

      // Update local state
      setReviews(prev => [reviewData, ...prev]);
      
      return reviewData;
    } catch (error) {
      console.error('Error in addReview:', error);
      throw error;
    }
  };

  const loadMoreReviews = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <ReviewsContext.Provider value={{
      reviews,
      isLoading,
      error,
      hasMore,
      addReview,
      loadMoreReviews
    }}>
      {children}
    </ReviewsContext.Provider>
  );
}; 