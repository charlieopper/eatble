import React from 'react';

export default function RestaurantDebug({ restaurants }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-red-500">
      <h2 className="text-xl font-bold mb-4">Debug: {restaurants.length} Restaurants</h2>
      
      {restaurants.map(restaurant => (
        <div key={restaurant.place_id} className="mb-4 p-2 border border-gray-200 rounded">
          <h3 className="font-semibold">{restaurant.name}</h3>
          <p>ID: {restaurant.place_id}</p>
          <p>Rating: {restaurant.rating}</p>
          <p>Types: {restaurant.types?.join(', ')}</p>
        </div>
      ))}
      
      {restaurants.length === 0 && (
        <p className="text-red-500">No restaurants found in data!</p>
      )}
    </div>
  );
} 