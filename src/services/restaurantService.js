import { RateLimiter } from '../utils/rateLimiter';
import { adaptGooglePlaceToMockFormat } from '../utils/placeAdapter';
import { getAllergenEmoji } from '../utils/allergens';
import { db } from '@/pages/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const rateLimiter = new RateLimiter();

// Debug counters
let cacheHits = 0;
let cacheMisses = 0;
let apiCalls = 0;
let totalSaved = 0;

// Helper function to check if Google Maps is available
const isGoogleMapsAvailable = () => {
  return window.googleMapsLoaded === true || 
         (window.google && window.google.maps && window.google.maps.places);
};

// Enhanced cache implementation
const restaurantCache = {
  nearbySearches: new Map(),
  placeDetails: new Map(),
  
  // Cache expiration time (30 days in milliseconds)
  EXPIRATION: 30 * 24 * 60 * 60 * 1000,
  
  // Save to localStorage
  saveToStorage() {
    try {
      // Save nearby searches
      const nearbyData = {};
      this.nearbySearches.forEach((value, key) => {
        nearbyData[key] = value;
      });
      localStorage.setItem('restaurantCacheNearby', JSON.stringify(nearbyData));
      
      // Save place details
      const detailsData = {};
      this.placeDetails.forEach((value, key) => {
        detailsData[key] = value;
      });
      localStorage.setItem('restaurantCacheDetails', JSON.stringify(detailsData));
      
    } catch (error) {
      console.error('[Cache] Error saving to localStorage:', error);
    }
  },
  
  // Load from localStorage
  loadFromStorage() {
    try {
      // Load nearby searches
      const nearbyData = localStorage.getItem('restaurantCacheNearby');
      if (nearbyData) {
        const parsed = JSON.parse(nearbyData);
        Object.entries(parsed).forEach(([key, value]) => {
          // Only load if not expired
          if (value.timestamp && (Date.now() - value.timestamp) < this.EXPIRATION) {
            this.nearbySearches.set(key, value);
          }
        });
      }
      
      // Load place details
      const detailsData = localStorage.getItem('restaurantCacheDetails');
      if (detailsData) {
        const parsed = JSON.parse(detailsData);
        Object.entries(parsed).forEach(([key, value]) => {
          // Only load if not expired
          if (value.timestamp && (Date.now() - value.timestamp) < this.EXPIRATION) {
            this.placeDetails.set(key, value);
          }
        });
      }
      
    } catch (error) {
      console.error('[Cache] Error loading from localStorage:', error);
    }
  }
};

// Initialize cache from localStorage
restaurantCache.loadFromStorage();

export const restaurantService = {
  async getRestaurants(page = 1, limit = 10, location = { lat: 37.7749, lng: -122.4194 }) {
    try {
      
      // Create a cache key for this location
      const locationKey = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
      let places = [];
      let fromCache = false;
      
      // Check if we have cached results for this location
      if (restaurantCache.nearbySearches.has(locationKey)) {
        const cachedData = restaurantCache.nearbySearches.get(locationKey);
        if ((Date.now() - cachedData.timestamp) < restaurantCache.EXPIRATION) {
          places = cachedData.data;
          fromCache = true;
          totalSaved++;
        } else {
          console.log('[Cache] Expired nearby search results for location: ' + locationKey);
        }
      }
      
      // If not in cache or expired, fetch from API
      if (!fromCache) {
        await rateLimiter.acquireToken();
        apiCalls++;
        places = await this.fetchNearbyRestaurants(location, 5000);
        
        // Store in cache with timestamp
        restaurantCache.nearbySearches.set(locationKey, {
          data: places,
          timestamp: Date.now()
        });
        restaurantCache.saveToStorage();
      }
      
      // Calculate pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedPlaces = places.slice(start, end);
      
      // Only fetch details for the paginated places (not all places)
      const detailedPlaces = await Promise.all(
        paginatedPlaces.map(async (place) => {
          try {
            // Try to get from cache first
            if (restaurantCache.placeDetails.has(place.id)) {
              const cachedData = restaurantCache.placeDetails.get(place.id);
              if ((Date.now() - cachedData.timestamp) < restaurantCache.EXPIRATION) {
                cacheHits++;
                totalSaved++;
                return { ...place, ...cachedData.data };
              }
            }
            
            // If not in cache, fetch details
            cacheMisses++;
            apiCalls++;
            
            // Only fetch if Google Maps is available
            if (isGoogleMapsAvailable()) {
              const details = await this.fetchPlaceDetails(place.id);
              return { ...place, ...details };
            } else {
              console.warn('[GoogleMaps] API not available, skipping details fetch for ' + place.id);
              return place;
            }
          } catch (error) {
            console.error(`Error fetching details for ${place.id}:`, error);
            return place;
          }
        })
      );
      
      // Fetch Eatable data for the paginated places
      const eatableData = await this.fetchBatchEatableData(paginatedPlaces.map(p => p.id));
      
      // Format results
      const formattedResults = detailedPlaces.map(place => 
        adaptGooglePlaceToMockFormat(place, eatableData[place.id])
      );
            
      return {
        restaurants: formattedResults,
        hasMore: end < places.length,
        total: places.length
      };
    } catch (error) {
      console.error('❌ Error in getRestaurants:', error);
      return { restaurants: [], hasMore: false, total: 0 };
    }
  },

  async searchRestaurants(query, page = 1, limit = 10) {
    try {      
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
      if (restaurantCache.placeDetails.has(placeId)) {
        const cachedData = restaurantCache.placeDetails.get(placeId);
        // Check if cache is still valid
        if ((Date.now() - cachedData.timestamp) < restaurantCache.EXPIRATION) {
          return cachedData.data;
        }
      }

      await rateLimiter.acquireToken();
      
      const [placeDetails, eatableData] = await Promise.all([
        this.fetchPlaceDetails(placeId),
        this.fetchEatableData(placeId)
      ]);

      const formattedPlace = adaptGooglePlaceToMockFormat(placeDetails, eatableData);
      restaurantCache.placeDetails.set(placeId, {
        data: formattedPlace,
        timestamp: Date.now()
      });
      restaurantCache.saveToStorage();
      
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
    return data.places || [];
  },

  async fetchPlaceDetails(placeId) {
    try {
      // Check cache first
      if (restaurantCache.placeDetails.has(placeId)) {
        const cachedData = restaurantCache.placeDetails.get(placeId);
        // Check if cache is still valid
        if ((Date.now() - cachedData.timestamp) < restaurantCache.EXPIRATION) {
          return cachedData.data;
        }
      }
      
      // If not in cache or expired, fetch from API
      
      await rateLimiter.acquireToken();
      
      // Check if Google Maps API is available
      if (!isGoogleMapsAvailable()) {
        console.error('[GoogleMaps] API not loaded yet');
        
        // Wait for Google Maps to load (max 5 seconds)
        let attempts = 0;
        const maxAttempts = 50; // 50 * 100ms = 5 seconds
        
        while (!isGoogleMapsAvailable() && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        // Final check
        if (!isGoogleMapsAvailable()) {
          throw new Error('Google Maps API not loaded after waiting');
        }
      }
      
      return new Promise((resolve, reject) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails(
          { placeId: placeId, fields: ['name', 'rating', 'formatted_address', 'photos', 'website', 'price_level', 'reviews', 'types'] },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              // Store in cache with timestamp
              restaurantCache.placeDetails.set(placeId, {
                data: place,
                timestamp: Date.now()
              });
              restaurantCache.saveToStorage();
              resolve(place);
            } else {
              reject(new Error(`Place details request failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      
      // If we have a cached version (even if expired), return it as fallback
      if (restaurantCache.placeDetails.has(placeId)) {
        return restaurantCache.placeDetails.get(placeId).data;
      }
      
      throw error;
    }
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