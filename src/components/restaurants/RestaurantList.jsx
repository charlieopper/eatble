import React from 'react';
import RestaurantCard from './RestaurantCard';

const RestaurantList = ({ restaurants = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px 0' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid #e5e7eb',
          borderTopColor: '#22c55e',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 0',
      }}>
        <p style={{ color: '#6b7280' }}>No restaurants found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {restaurants.map((restaurant, index) => (
        <RestaurantCard 
          key={restaurant.id || index} 
          restaurant={restaurant} 
        />
      ))}
    </div>
  );
};

export default RestaurantList;

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