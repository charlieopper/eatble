export const calculateAverageRating = (reviews) => {
  if (!reviews || !Array.isArray(reviews)) return 0;
  
  const validReviews = reviews.filter(review => typeof review.rating === 'number');
  if (validReviews.length === 0) return 0;
  
  const sum = validReviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / validReviews.length;
};

export const getReviewSummary = (reviews) => {
  if (!reviews || !Array.isArray(reviews)) {
    return {
      rating: 0,
      reviewCount: 0,
      quote: 'No review available'
    };
  }

  return {
    rating: calculateAverageRating(reviews),
    reviewCount: reviews.length,
    quote: reviews[0]?.text || 'No review available'
  };
}; 