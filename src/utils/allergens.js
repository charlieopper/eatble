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
    'Sesame': '✨',
    'Gluten': '🌾',
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