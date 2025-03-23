import { RateLimiter } from '../utils/rateLimiter';
import { adaptGooglePlaceToMockFormat } from '../utils/placeAdapter';
import { getAllergenEmoji } from '../utils/allergens';
import { db } from '@/pages/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const rateLimiter = new RateLimiter();
const restaurantCache = new Map();

export const restaurantService = {
  async getRestaurants(page = 1, limit = 10, location = { lat: 37.7749, lng: -122.4194 }) {
    try {
      console.log('🔍 getRestaurants called with:', { page, limit, location });
      
      await rateLimiter.acquireToken();
      const places = await this.fetchNearbyRestaurants(location, 5000);
      
      // Fetch full details for each place to get reviews
      const detailedPlaces = await Promise.all(
        places.map(async (place) => {
          try {
            const details = await this.fetchPlaceDetails(place.id);
            return { ...place, ...details };
          } catch (error) {
            console.error(`Error fetching details for ${place.id}:`, error);
            return place;
          }
        })
      );
      
      const eatableData = await this.fetchBatchEatableData(places.map(p => p.id));
      
      // Format results and add pagination
      const start = (page - 1) * limit;
      const paginatedPlaces = detailedPlaces.slice(start, start + limit);
      
      const formattedResults = paginatedPlaces.map(place => 
        adaptGooglePlaceToMockFormat(place, eatableData[place.id])
      );
      
      return {
        restaurants: formattedResults,
        hasMore: start + limit < places.length,
        total: places.length
      };
    } catch (error) {
      console.error('❌ Error in getRestaurants:', error);
      return { restaurants: [], hasMore: false, total: 0 };
    }
  },

  async searchRestaurants(query, page = 1, limit = 10) {
    try {
      console.log('🔍 searchRestaurants called with:', { query, page, limit });
      
      await rateLimiter.acquireToken();
      const location = { lat: 37.7749, lng: -122.4194 }; // Default to SF
      const places = await this.fetchNearbyRestaurants(location, 5000);
      
      // Filter places by query
      const filteredPlaces = places.filter(place => 
        place.displayName?.text?.toLowerCase().includes(query.toLowerCase())
      );
      
      const eatableData = await this.fetchBatchEatableData(filteredPlaces.map(p => p.id));
      
      // Format results and add pagination
      const start = (page - 1) * limit;
      const paginatedPlaces = filteredPlaces.slice(start, start + limit);
      
      const formattedResults = paginatedPlaces.map(place => 
        adaptGooglePlaceToMockFormat(place, eatableData[place.id])
      );
      
      return {
        restaurants: formattedResults,
        hasMore: start + limit < filteredPlaces.length,
        total: filteredPlaces.length
      };
    } catch (error) {
      console.error('❌ Error in searchRestaurants:', error);
      return { restaurants: [], hasMore: false, total: 0 };
    }
  },

  async getRestaurantDetails(placeId) {
    try {
      // Check cache first
      if (restaurantCache.has(placeId)) {
        return restaurantCache.get(placeId);
      }

      await rateLimiter.acquireToken();
      
      const [placeDetails, eatableData] = await Promise.all([
        this.fetchPlaceDetails(placeId),
        this.fetchEatableData(placeId)
      ]);

      const formattedPlace = adaptGooglePlaceToMockFormat(placeDetails, eatableData);
      restaurantCache.set(placeId, formattedPlace);
      
      return formattedPlace;
    } catch (error) {
      console.error('Error in getRestaurantDetails:', error);
      throw error;
    }
  },

  // Helper methods
  async getCoordinates(location) {
    if (location.geometry) {
      return {
        lat: location.geometry.lat(),
        lng: location.geometry.lng()
      };
    }

    await rateLimiter.acquireToken();
    const geocoder = new window.google.maps.Geocoder();
    const result = await geocoder.geocode({ address: location.description });
    
    return {
      lat: result.results[0].geometry.location.lat(),
      lng: result.results[0].geometry.location.lng()
    };
  },

  async fetchNearbyRestaurants(coordinates, radius) {
    const endpoint = 'https://places.googleapis.com/v1/places:searchNearby';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.priceLevel',
          'places.rating',
          'places.userRatingCount',
          'places.primaryType',
          'places.regularOpeningHours',
          'places.internationalPhoneNumber',
          'places.location',
          'places.types',
          'places.photos',
          'places.reviews.text',
          'places.reviews.rating',
          'places.reviews.relativePublishTimeDescription',
          'places.reviews.publishTime',
          'places.reviews.originalText'
        ].join(',')
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: {
              latitude: coordinates.lat,
              longitude: coordinates.lng
            },
            radius: radius.toString()
          }
        },
        includedTypes: ["restaurant"],
        languageCode: "en",
        maxResultCount: 20
      })
    });

    const data = await response.json();
    console.log('📦 Places API response:', data);
    return data.places || [];
  },

  async fetchPlaceDetails(placeId) {
    const endpoint = `https://places.googleapis.com/v1/places/${placeId}`;
    console.log(`🔍 Fetching details for place: ${placeId}`);
    
    const response = await fetch(endpoint, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,userRatingCount,reviews,reviews.text,reviews.rating,reviews.authorAttribution,regularOpeningHours,priceLevel'
      }
    });

    const data = await response.json();
    console.log('📦 Place details response:', {
      placeId,
      hasReviews: Boolean(data.reviews),
      reviewCount: data.reviews?.length,
      firstReview: data.reviews?.[0]
    });
    
    return data;
  },

  async fetchEatableData(placeId) {
    const restaurantRef = doc(db, 'restaurants', placeId);
    const restaurantDoc = await getDoc(restaurantRef);
    return restaurantDoc.exists() ? restaurantDoc.data() : null;
  },

  async fetchBatchEatableData(placeIds) {
    const eatableData = {};
    await Promise.all(
      placeIds.map(async (id) => {
        eatableData[id] = await this.fetchEatableData(id);
      })
    );
    return eatableData;
  }
};

// Make sure to export both the service object and individual methods
export const {
  getRestaurants,
  searchRestaurants,
  getRestaurantDetails
} = restaurantService;

export default restaurantService;