import React from 'react';
import { X, Heart, MapPin, Phone, Globe, Clock, ChefHat, FileText } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

export default function RestaurantDetailModal({ restaurant, onClose }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const defaultImage = 'https://source.unsplash.com/random/800x600/?restaurant';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md z-10"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        {/* Restaurant image */}
        <div className="relative h-64">
          <img
            src={restaurant.image || defaultImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => toggleFavorite(restaurant)}
            className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md"
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorite(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Restaurant details */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.cuisines?.map((cuisine, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                {cuisine}
              </span>
            ))}
          </div>
          
          {/* Contact and hours */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
              <span>{restaurant.address || "123 Main St, San Francisco, CA 94110"}</span>
            </div>
            
            {restaurant.phone && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-500 mr-2" />
                <span>{restaurant.phone}</span>
              </div>
            )}
            
            {restaurant.website && (
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-gray-500 mr-2" />
                <a href={`https://${restaurant.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {restaurant.website}
                </a>
              </div>
            )}
            
            {restaurant.hours && (
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
                <span>{restaurant.hours}</span>
              </div>
            )}
          </div>
          
          {/* Allergen accommodations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Allergen Accommodations</h3>
            <div className="flex flex-wrap gap-4">
              <div className={`flex items-center ${
                restaurant.eatableReviews && restaurant.eatableReviews.some(review => 
                  review.accommodations?.chefAvailable === true
                ) ? 'text-green-600' : 'text-gray-400'}`}>
                <ChefHat className="w-5 h-5 mr-2" />
                <span>{
                  restaurant.eatableReviews && restaurant.eatableReviews.some(review => 
                    review.accommodations?.chefAvailable === true
                  ) ? 'Chef available' : 'No chef available'
                }</span>
              </div>
              <div className={`flex items-center ${
                restaurant.eatableReviews && restaurant.eatableReviews.some(review => 
                  review.accommodations?.allergenMenu === true
                ) ? 'text-green-600' : 'text-gray-400'}`}>
                <FileText className="w-5 h-5 mr-2" />
                <span>{
                  restaurant.eatableReviews && restaurant.eatableReviews.some(review => 
                    review.accommodations?.allergenMenu === true
                  ) ? 'Allergen menu' : 'No allergen menu'
                }</span>
              </div>
            </div>
          </div>
          
          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Reviews</h3>
            
            {/* eatABLE Review */}
            {restaurant.eatableReview && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{restaurant.eatableReview.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm ml-1">({restaurant.eatableReview.reviewCount} eatABLE reviews)</span>
                </div>
                <p className="text-gray-700">{restaurant.eatableReview.quote}</p>
              </div>
            )}
            
            {/* Google Review */}
            {restaurant.googleReview && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{restaurant.googleReview.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm ml-1">({restaurant.googleReview.reviewCount} Google reviews)</span>
                </div>
                <p className="text-gray-700">{restaurant.googleReview.quote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 