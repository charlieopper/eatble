import React from 'react';
import RestaurantCard from './RestaurantCard';

export default function RestaurantList({ restaurants, isLoading, onSelectRestaurant }) {
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '40px 0' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(0, 0, 0, 0.1)', 
          borderLeftColor: '#3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        color: '#6b7280'
      }}>
        <p>No restaurants found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div>
      {restaurants.map(restaurant => (
        <RestaurantCard 
          key={restaurant.id} 
          restaurant={restaurant} 
          onClick={onSelectRestaurant}
        />
      ))}
    </div>
  );
}

// Bottom Navigation
const BottomNavigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center">
      <button className="flex flex-col items-center text-blue-600">
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button className="flex flex-col items-center text-gray-500">
        <Search className="h-6 w-6" />
        <span className="text-xs mt-1">Search</span>
      </button>
      
      <button className="flex flex-col items-center text-gray-500">
        <Star className="h-6 w-6" />
        <span className="text-xs mt-1">Reviews</span>
      </button>
      
      <button className="flex flex-col items-center text-gray-500">
        <Heart className="h-6 w-6" />
        <span className="text-xs mt-1">Favorites</span>
      </button>
      
      <button className="flex flex-col items-center text-gray-500">
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
}; 