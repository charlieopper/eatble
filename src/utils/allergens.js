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