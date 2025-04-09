/**
 * Gets the most relevant review quote from a list of reviews
 * @param {Array} reviews - Array of review objects
 * @param {number} maxLength - Maximum length of the quote (default 200)
 * @returns {string|null} The selected review quote or null if no suitable quote found
 */
export const getReviewQuote = (reviews, maxLength = 200) => {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return null;
  }

  // If only one review, use it if it has text
  if (reviews.length === 1) {
    const reviewText = reviews[0].text?.trim();
    if (!reviewText) return null;
    return reviewText.length > maxLength 
      ? `${reviewText.substring(0, maxLength)}...` 
      : reviewText;
  }

  // For multiple reviews, find the one with most helpful votes
  const reviewsWithText = reviews
    .filter(review => review.text?.trim())
    .sort((a, b) => {
      // Sort by helpful count first
      const helpfulDiff = (b.helpfulCount || 0) - (a.helpfulCount || 0);
      // If helpful counts are equal, sort by date
      return helpfulDiff !== 0 ? helpfulDiff : 
        new Date(b.date) - new Date(a.date);
    });

  if (reviewsWithText.length === 0) return null;

  const selectedReview = reviewsWithText[0].text.trim();
  return selectedReview.length > maxLength 
    ? `${selectedReview.substring(0, maxLength)}...` 
    : selectedReview;
}; 