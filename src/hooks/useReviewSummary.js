import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useReviewSummary = (restaurantId) => {
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 }
    }
  });

  useEffect(() => {
    if (!restaurantId) return;

    // Query reviews for this restaurant
    const reviewsRef = collection(db, 'reviews');
    const restaurantReviewsQuery = query(
      reviewsRef,
      where('restaurantId', '==', restaurantId)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(restaurantReviewsQuery, (snapshot) => {
      const reviews = snapshot.docs.map(doc => doc.data());
      
      // Calculate distribution
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
          totalReviews > 0 
            ? Math.round((distribution[rating].count / totalReviews) * 100) 
            : 0;
      });

      // Calculate average rating
      const averageRating = totalReviews > 0
        ? Number((reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1))
        : 0;

      setSummary({
        averageRating,
        totalReviews,
        distribution
      });
    });

    return () => unsubscribe();
  }, [restaurantId]);

  return summary;
}; 