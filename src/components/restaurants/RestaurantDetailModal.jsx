import React from 'react';
import { X, Star, Clock, Phone, Globe, MapPin, Heart } from 'lucide-react';
import { formatPhoneNumber, formatTime } from '../../utils/format';
import { getAllergenEmoji } from '../../utils/allergens';
import { useFavorites } from '../../hooks/useFavorites';
import defaultImage from '../../assets/eatable-icon.png';

export default function RestaurantDetailModal({ restaurant, onClose }) {
  const { toggleFavorite, isFavorite } = useFavorites(restaurant.place_id);

  const allergenCounts = restaurant.eatableReviews?.reduce((acc, review) => {
    review.allergens.forEach(allergen => {
      acc[allergen] = (acc[allergen] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
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
            src={restaurant.photos?.[0]?.getUrl() || defaultImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => toggleFavorite()}
            className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md"
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Restaurant details */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>

          {/* Google Reviews */}
          <div className="flex items-center mb-2">
            <Star className="text-yellow-400 w-5 h-5" />
            <span className="ml-1">
              {restaurant.rating} ({restaurant.user_ratings_total} Google reviews)
            </span>
          </div>

          {/* Eatable Reviews */}
          {restaurant.eatableRating && (
            <div className="flex items-center mb-4 text-blue-600">
              <Star className="w-5 h-5" />
              <span className="ml-1">
                {restaurant.eatableRating} ({restaurant.eatableReviews?.length} eatable reviews)
              </span>
            </div>
          )}

          {/* Cuisine Type & Price Level */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-600">
              {restaurant.types?.[0]?.replace(/_/g, ' ')}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {'$'.repeat(restaurant.price_level || 1)}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start mb-4 text-gray-600">
            <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
            <span>{restaurant.formatted_address}</span>
          </div>

          {/* Hours */}
          {restaurant.opening_hours && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Hours</h3>
              <ul className="space-y-1 text-gray-600">
                {restaurant.opening_hours.weekday_text?.map((day, index) => (
                  <li key={index}>{day}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-2 mb-6">
            {restaurant.formatted_phone_number && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                <a href={`tel:${restaurant.formatted_phone_number}`}>
                  {formatPhoneNumber(restaurant.formatted_phone_number)}
                </a>
              </div>
            )}
            {restaurant.website && (
              <div className="flex items-center text-gray-600">
                <Globe className="w-5 h-5 mr-2 flex-shrink-0" />
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-blue-600"
                >
                  {new URL(restaurant.website).hostname}
                </a>
              </div>
            )}
          </div>

          {/* Allergens */}
          {Object.entries(allergenCounts || {}).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Reported Allergens</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(allergenCounts).map(([allergen, count]) => (
                  <div
                    key={allergen}
                    className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    <span className="mr-1">{getAllergenEmoji(allergen)}</span>
                    <span>{allergen}</span>
                    <span className="ml-1 text-gray-500">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {restaurant.eatableReviews?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Eatable Reviews</h3>
              <div className="space-y-4">
                {restaurant.eatableReviews.map((review, index) => (
                  <div key={index} className="border-t pt-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{review.user}</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{review.text}</p>
                    {review.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {review.allergens.map((allergen) => (
                          <span
                            key={allergen}
                            className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {getAllergenEmoji(allergen)} {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 