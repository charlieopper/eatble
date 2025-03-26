// This is a mock service for handling reviews
// In a real app, this would interact with an API

// Store reviews in localStorage for persistence between page refreshes
const STORAGE_KEY = 'eatable_user_reviews';

// Get all reviews for the current user
const getUserReviews = () => {
  try {
    const storedReviews = localStorage.getItem(STORAGE_KEY);
    return storedReviews ? JSON.parse(storedReviews) : [];
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return [];
  }
};

// Add a new review
const addReview = (review) => {
  try {
    const reviews = getUserReviews();
    const newReview = {
      ...review,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString()
    };
    
    const updatedReviews = [newReview, ...reviews];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
    
    return newReview;
  } catch (error) {
    console.error('Error adding review:', error);
    throw new Error('Failed to add review');
  }
};

// Delete a review
const deleteReview = (reviewId) => {
  try {
    const reviews = getUserReviews();
    const updatedReviews = reviews.filter(review => review.id !== reviewId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review');
  }
};

// Update a review
const updateReview = (reviewId, updatedData) => {
  try {
    const reviews = getUserReviews();
    const updatedReviews = reviews.map(review => 
      review.id === reviewId ? { ...review, ...updatedData } : review
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
    return updatedReviews.find(review => review.id === reviewId);
  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error('Failed to update review');
  }
};

// Submit review to Firebase (mock implementation)
const submitReview = async (restaurantId, reviewData) => {
  try {    
    // Create a mock review ID
    const reviewId = `mock-review-${Date.now()}`;
    
    // Also save to localStorage for persistence
    addReview({
      id: reviewId,
      restaurantId,
      ...reviewData
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return reviewId;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export const reviewService = {
  getUserReviews,
  addReview,
  deleteReview,
  updateReview,
  submitReview
};

export default reviewService; 