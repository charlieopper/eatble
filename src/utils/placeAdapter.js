import { getAllergenEmoji } from '../utils/allergens';

export function adaptGooglePlaceToMockFormat(place, eatableData = null) {

  // Format opening hours
  const formatOpeningHours = (openingHours) => {
    console.log('📅 Opening hours data:', openingHours);
    
    if (!openingHours?.weekdayDescriptions?.length) {
      return 'Hours not available';
    }
    
    // Try to get today's hours
    const today = new Date().getDay();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayString = weekdays[today];
    
    const todayHours = openingHours.weekdayDescriptions.find(desc => 
      desc.startsWith(todayString)
    );
    
    return todayHours || openingHours.weekdayDescriptions[0] || 'Hours not available';
  };

  // Format phone number
  const formatPhoneNumber = (phone) => {
    
    if (!phone) {
      return 'Phone not available';
    }
    
    // Remove the +1 prefix if it exists and clean the number
    const cleaned = phone.replace(/^\+1/, '').replace(/[^\d]/g, '');
    
    // Format US numbers (10 digits)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    
    // If we can't format it, return original without +1
    return phone.replace(/^\+1/, '');
  };

  // Check if we need to request additional fields
  if (!place.regularOpeningHours || !place.internationalPhoneNumber) {
    console.warn('⚠️ Missing hours or phone number. Make sure to request these fields in the Places API call');
  }

  // Format and limit cuisines
  const formatCuisines = (types, limit = 3) => {
    if (!types?.length) return ['Restaurant'];
    
    const filteredTypes = types.filter(type => 
      type !== 'restaurant' && 
      type !== 'point_of_interest' && 
      type !== 'establishment' && 
      type !== 'food' &&  // Remove generic food type
      type !== 'store' &&  // Remove generic store type
      type !== 'business'  // Remove generic business type
    );

    const formattedTypes = filteredTypes.map(type => 
      type.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );

    // Return first 'limit' cuisines or ['Restaurant'] if none left after filtering
    return formattedTypes.slice(0, limit).length > 0 
      ? formattedTypes.slice(0, limit) 
      : ['Restaurant'];
  };

  // Get the best review (highest rating with text)
  const getBestReview = (reviews) => {
    if (!reviews || !reviews.length) {
      return 'No Google review available';
    }

    // Sort reviews by rating (highest first)
    const sortedReviews = [...reviews].sort((a, b) => b.rating - a.rating);
    const bestReview = sortedReviews[0];

    if (bestReview?.text?.text || bestReview?.text) {
      const reviewText = bestReview.text?.text || bestReview.text;
      
      // If text is shorter than limit, return as is
      if (reviewText.length <= 150) return reviewText;
      
      // Find the last space within the first 150 characters
      const truncateIndex = reviewText.lastIndexOf(' ', 150);
      return truncateIndex > 0 ? reviewText.substring(0, truncateIndex) + '...' : reviewText;
    }

    return 'No Google review available';
  };

  // Calculate average eatABLE rating from reviews
  const calculateEatableRating = (reviews) => {
    if (!reviews || !reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const eatableRating = calculateEatableRating(eatableData?.reviews);

  const adaptedPlace = {
    id: place.id || 'unknown',
    place_id: place.id || 'unknown',
    name: place.displayName?.text || 'Unknown Restaurant',
    image: place.photos?.[0]?.getUrl?.() || null,
    cuisines: formatCuisines(place.types, 3), // Limit to 3 cuisine types
    rating: place.rating || 0,
    user_ratings_total: place.userRatingCount || 0,
    price_level: place.priceLevel === 'PRICE_LEVEL_INEXPENSIVE' ? 1 
      : place.priceLevel === 'PRICE_LEVEL_MODERATE' ? 2
      : place.priceLevel === 'PRICE_LEVEL_EXPENSIVE' ? 3
      : place.priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE' ? 4
      : 0,
    eatableReview: {
      rating: eatableRating || 0,
      reviewCount: eatableData?.reviews?.length || 0,
      quote: eatableData?.reviews?.[0]?.text || 'No review available'
    },
    googleReview: {
      rating: Number(place.rating) || 0,
      reviewCount: place.userRatingCount || 0,
      quote: getBestReview(place.reviews)
    },
    accommodations: {
      chefAvailable: eatableData?.chefAvailable || false,
      allergenMenu: eatableData?.allergenMenu || false
    },
    hours: formatOpeningHours(place.regularOpeningHours),
    phone: formatPhoneNumber(place.internationalPhoneNumber),
    address: place.formattedAddress || 'Address not available',
    website: place.websiteUri || '',
    allergens: (eatableData?.allergens || []).map(allergen => ({
      name: allergen,
      icon: getAllergenEmoji(allergen),
      rating: {
        count: eatableData?.allergenRatings?.[allergen]?.count || 0,
        average: eatableData?.allergenRatings?.[allergen]?.average || 0
      }
    })),
    lat: place.location?.latitude || 37.7749 + (Math.random() - 0.5) * 0.05,
    lng: place.location?.longitude || -122.4194 + (Math.random() - 0.5) * 0.05,
    map: null
  };
  
  return adaptedPlace;
} 