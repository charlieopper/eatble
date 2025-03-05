import React from 'react';

export const AllergenSelector = ({ selectedAllergens, toggleAllergen }) => {
  // List of all allergens with their emoji icons
  const allergens = [
    { name: 'Peanuts', emoji: '🥜' },
    { name: 'Tree Nuts', emoji: '🌰' },
    { name: 'Dairy', emoji: '🥛' },
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Wheat', emoji: '🌾' },
    { name: 'Gluten', emoji: '🍞' },
    { name: 'Fish', emoji: '🐟' },
    { name: 'Shellfish', emoji: '🦐' },
    { name: 'Soy', emoji: '🫘' },
    { name: 'Sesame', emoji: '🌱' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px'
    }}>
      {allergens.map((allergen) => (
        <button
          key={allergen.name}
          type="button"
          onClick={() => toggleAllergen(allergen.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            border: `1px solid ${selectedAllergens.includes(allergen.name) ? '#3b82f6' : '#d1d5db'}`,
            borderRadius: '6px',
            backgroundColor: selectedAllergens.includes(allergen.name) ? '#eff6ff' : 'white',
            color: '#4b5563',
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <span style={{ marginRight: '8px', fontSize: '18px' }}>{allergen.emoji}</span>
          {allergen.name}
        </button>
      ))}
    </div>
  );
}; 