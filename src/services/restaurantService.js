const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const searchRestaurants = async (location, radius = 5000) => {
  try {
    // First, get the coordinates for the location if we don't have them
    let coordinates;
    if (!location.geometry) {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ address: location.description });
      coordinates = {
        lat: result.results[0].geometry.location.lat(),
        lng: result.results[0].geometry.location.lng()
      };
    } else {
      coordinates = {
        lat: location.geometry.lat(),
        lng: location.geometry.lng()
      };
    }

    // Create Places Service
    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    // Search for restaurants
    const request = {
      location: coordinates,
      radius: radius,
      type: ['restaurant']
    };

    return new Promise((resolve, reject) => {
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Restaurant search error:', error);
    throw error;
  }
};

export const getRestaurantDetails = async (placeId) => {
  try {
    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      placeId: placeId,
      fields: ['name', 'rating', 'formatted_address', 'formatted_phone_number', 
               'opening_hours', 'website', 'photos', 'price_level', 'reviews']
    };

    return new Promise((resolve, reject) => {
      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place Details API error: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Restaurant details error:', error);
    throw error;
  }
};

export const sortRestaurants = (restaurants, sortBy, userLocation) => {
  switch (sortBy) {
    case 'rating':
      return [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    case 'distance':
      if (!userLocation) return restaurants;
      return [...restaurants].sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.geometry.location.lat(),
          a.geometry.location.lng()
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.geometry.location.lat(),
          b.geometry.location.lng()
        );
        return distA - distB;
      });
    
    case 'relevance':
    default:
      return restaurants;
  }
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Radius of the earth in miles (was 6371 for km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Enhanced search function that gets detailed information
export const searchRestaurantsWithDetails = async (location, radius = 8047) => { // Default 5 miles in meters
  try {
    const basicResults = await searchRestaurants(location, radius);
    
    // Get detailed information for each restaurant
    const detailedResults = await Promise.all(
      basicResults.map(async (restaurant) => {
        try {
          const details = await getRestaurantDetails(restaurant.place_id);
          
          // Merge basic and detailed information
          return {
            ...restaurant,
            ...details,
            // Add mock eatable data for now
            eatableRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3-5
            eatableReviews: generateMockReviews(restaurant.name)
          };
        } catch (error) {
          console.error(`Error getting details for ${restaurant.name}:`, error);
          return restaurant;
        }
      })
    );
    
    console.log('Basic results:', basicResults);
    console.log('Detailed results:', detailedResults);
    
    return detailedResults;
  } catch (error) {
    console.error('Error in searchRestaurantsWithDetails:', error);
    throw error;
  }
};

// Helper function to generate mock reviews with allergens
const generateMockReviews = (restaurantName) => {
  const allergens = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame', 'Gluten'];
  const reviewCount = Math.floor(Math.random() * 5) + 1; // 1-5 reviews
  
  return Array(reviewCount).fill(0).map((_, i) => {
    const randomAllergens = allergens
      .filter(() => Math.random() > 0.7) // Randomly select some allergens
      .slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 allergens per review
    
    return {
      id: `review-${i}-${Date.now()}`,
      user: `User${Math.floor(Math.random() * 1000)}`,
      rating: Math.floor(Math.random() * 5) + 1,
      text: `This is a mock review for ${restaurantName}.`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
      allergens: randomAllergens
    };
  });
};

// Function to load more results using pagination token
export const loadMoreRestaurants = async (location, radius, pageToken) => {
  try {
    // Create Places Service
    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    // Search for more restaurants using the page token
    const request = {
      pageToken: pageToken
    };

    return new Promise((resolve, reject) => {
      service.nearbySearch(request, async (results, status, pagination) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Get detailed information for each restaurant
          const detailedResults = await Promise.all(
            results.map(async (restaurant) => {
              try {
                const details = await getRestaurantDetails(restaurant.place_id);
                
                return {
                  ...restaurant,
                  ...details,
                  // Add mock eatable data
                  eatableRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
                  eatableReviews: generateMockReviews(restaurant.name)
                };
              } catch (error) {
                console.error(`Error getting details for ${restaurant.name}:`, error);
                return restaurant;
              }
            })
          );
          
          resolve({
            results: detailedResults,
            hasMore: pagination && pagination.hasNextPage,
            nextPageToken: pagination ? pagination.nextPageToken : null
          });
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error loading more restaurants:', error);
    throw error;
  }
}; 