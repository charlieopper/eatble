export const getAllergenEmoji = (allergen) => {
  const allergenMap = {
    'Peanuts': '🥜',
    'Tree Nuts': '🌰',
    'Dairy': '🥛',
    'Eggs': '🥚',
    'Wheat': '🌾',
    'Soy': '🫘',
    'Fish': '🐟',
    'Shellfish': '🦐',
    'Sesame': '🌱',
    'Gluten': '🍞',
    // Add more allergens as needed
  };

  return allergenMap[allergen] || '⚠️';
};

/**
 * Ensures that all restaurants have properly formatted allergen data with ratings
 * @param {Array} restaurants - Array of restaurant objects
 * @returns {Array} - Array of restaurants with properly formatted allergen data
 */
export const ensureAllergenRatings = (restaurants) => {
  return restaurants.map(restaurant => {
    // Skip if restaurant already has properly formatted allergens with ratings
    if (restaurant.allergens && 
        restaurant.allergens.length > 0 && 
        typeof restaurant.allergens[0] === 'object' &&
        restaurant.allergens[0].rating) {
      return restaurant;
    }
    
    // Convert string allergens or add ratings to object allergens
    const formattedAllergens = Array.isArray(restaurant.allergens) 
      ? restaurant.allergens.map(allergen => {
          if (typeof allergen === 'string') {
            return {
              name: allergen,
              icon: getAllergenEmoji(allergen),
              rating: {
                count: Math.floor(Math.random() * 5) + 1,
                average: Math.round((Math.random() * 3 + 2) * 10) / 10
              }
            };
          } else if (typeof allergen === 'object' && !allergen.rating) {
            return {
              ...allergen,
              rating: {
                count: Math.floor(Math.random() * 5) + 1,
                average: Math.round((Math.random() * 3 + 2) * 10) / 10
              }
            };
          }
          return allergen;
        })
      : [];
    
    return {
      ...restaurant,
      allergens: formattedAllergens
    };
  });
};

/**
 * Calculates average ratings for each allergen from a collection of reviews
 * @param {Array} reviews - Array of review objects with allergens and ratings
 * @returns {Object} - Object with allergen names as keys and rating data as values
 */
export const calculateAllergenRatings = (reviews) => {
  console.debug('🔍 calculateAllergenRatings - Input reviews:', reviews);
  
  if (!reviews || !reviews.length) {
    console.debug('⚠️ No reviews provided to calculateAllergenRatings');
    return {};
  }
  
  const allergenRatings = {};
  
  reviews.forEach(review => {
    if (!review.allergens || !review.allergens.length) return;
    
    console.debug(`🔍 Processing review with allergens: ${JSON.stringify(review.allergens)}, rating: ${review.rating}`);
    
    // Get the normalized allergen names
    const allergens = Array.isArray(review.allergens) 
      ? review.allergens 
      : [review.allergens];
    
    allergens.forEach(allergen => {
      // Handle both string allergens and object allergens
      const allergenName = typeof allergen === 'object' ? allergen.name : allergen;
      
      if (!allergenName) return;
      
      if (!allergenRatings[allergenName]) {
        allergenRatings[allergenName] = {
          count: 0,
          total: 0,
          average: 0
        };
      }
      
      allergenRatings[allergenName].count += 1;
      allergenRatings[allergenName].total += review.rating;
      allergenRatings[allergenName].average = 
        allergenRatings[allergenName].total / allergenRatings[allergenName].count;
    });
  });
  
  // Clean up the object to only include count and average
  Object.keys(allergenRatings).forEach(allergen => {
    delete allergenRatings[allergen].total;
    // Round average to 1 decimal place
    allergenRatings[allergen].average = 
      Math.round(allergenRatings[allergen].average * 10) / 10;
  });
  
  console.debug('✅ Calculated allergen ratings:', allergenRatings);
  return allergenRatings;
};

/**
 * Formats allergen ratings into the structure expected by the UI components
 * @param {Object} allergenRatings - Object with allergen ratings data
 * @returns {Array} - Array of allergen objects with name, icon, and rating
 */
export const formatAllergenRatings = (allergenRatings) => {
  console.debug('🔍 formatAllergenRatings - Input ratings:', allergenRatings);
  
  if (!allergenRatings || Object.keys(allergenRatings).length === 0) {
    console.debug('⚠️ No allergen ratings to format');
    return [];
  }
  
  const formattedAllergens = Object.keys(allergenRatings).map(allergenName => {
    return {
      name: allergenName,
      icon: getAllergenEmoji(allergenName),
      rating: allergenRatings[allergenName]
    };
  });
  
  console.debug('✅ Formatted allergen ratings:', formattedAllergens);
  return formattedAllergens;
}; 