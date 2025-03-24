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

export const selectMostHelpfulReview = (reviews) => {
  console.log('[SelectMostHelpful Debug - Raw Reviews]', {
    reviews,
    reviewStructure: reviews?.[0]
  });

  if (!reviews || reviews.length === 0) {
    console.log('[SelectMostHelpful] No reviews found');
    return null;
  }

  // First try to find reviews with helpful votes
  const reviewsWithHelpful = reviews.filter(review => 
    review.helpfulVotes && review.helpfulVotes.length > 0
  );

  console.log('[SelectMostHelpful - Helpful Reviews]', {
    reviewsWithHelpful,
    hasHelpfulReviews: reviewsWithHelpful.length > 0
  });

  let selectedReview;
  if (reviewsWithHelpful.length > 0) {
    // Sort by helpful votes count (highest first)
    selectedReview = [...reviewsWithHelpful].sort((a, b) => 
      (b.helpfulVotes?.length || 0) - (a.helpfulVotes?.length || 0)
    )[0];
  } else {
    // If no reviews have helpful votes, get most recent review
    selectedReview = [...reviews].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt?.seconds * 1000);
      const dateB = new Date(b.date || b.createdAt?.seconds * 1000);
      return dateB - dateA;
    })[0];
  }

  console.log('[SelectMostHelpful] Raw selected review:', selectedReview);

  // Format the review data
  const formattedReview = {
    text: selectedReview.review || selectedReview.text || selectedReview.content || '',
    rating: selectedReview.rating || 0,
    reviewCount: reviews.length,
    helpfulVotes: selectedReview.helpfulVotes || [],
    userName: selectedReview.userName || selectedReview.authorName || 'Anonymous',
    date: selectedReview.date || 
          (selectedReview.createdAt?.seconds ? 
            new Date(selectedReview.createdAt.seconds * 1000).toLocaleDateString() 
            : new Date().toLocaleDateString())
  };

  console.log('[SelectMostHelpful - Formatted Review]', formattedReview);
  
  // Only return if we have review text
  if (!formattedReview.text) {
    console.log('[SelectMostHelpful] No review text found, trying next review');
    // Try the next review if this one has no text
    const remainingReviews = reviews.filter(r => r.id !== selectedReview.id);
    if (remainingReviews.length > 0) {
      return selectMostHelpfulReview(remainingReviews);
    }
  }

  return formattedReview;
}; 