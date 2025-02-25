import React from 'react';

export function AllergenSelector() {
  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h3 className="text-lg font-medium mb-3">Select Allergens:</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🥜</span> Peanuts
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🌰</span> Tree Nuts
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🥛</span> Dairy
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🥚</span> Eggs
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🌾</span> Wheat
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🍞</span> Gluten
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🐟</span> Fish
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🦐</span> Shellfish
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🫘</span> Soy
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>🌱</span> Sesame
        </button>
      </div>
      <button className="w-full bg-red-500 text-white py-3 rounded-md font-medium hover:bg-red-600 transition-colors">
        SEARCH RESTAURANTS
      </button>
      <div className="text-center mt-4">
        <a href="#" className="text-blue-600 hover:underline">
          Create Profile to Save Allergen Settings
        </a>
      </div>
    </div>
  );
} 