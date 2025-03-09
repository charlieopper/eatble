export function getAllergenEmoji(allergen) {
  const emojis = {
    'Peanuts': '🥜',
    'Tree Nuts': '🌰',
    'Dairy': '🥛',
    'Eggs': '🥚',
    'Wheat': '🌾',
    'Gluten': '🍞',
    'Fish': '🐟',
    'Shellfish': '🦐',
    'Soy': '🫘',
    'Sesame': '🌱'
  };
  return emojis[allergen] || '';
} 