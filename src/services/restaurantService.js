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

// Add more sample restaurants
const sampleRestaurants = [
  {
    id: 1,
    name: 'Zunchi Cafe',
    image: 'https://source.unsplash.com/random/800x600/?restaurant,cafe',
    cuisines: ['French', 'Italian'],
    hours: 'Open until 11PM Fri',
    phone: '(415) 552-2622',
    website: 'zunchicafe.com',
    address: '123 Main St, San Francisco, CA 94105',
    eatableReview: {
      rating: 5,
      reviewCount: 42,
      quote: 'Food was 10/10 and the chef took great care of our son who is allergic to peanuts and tree nuts'
    },
    googleReview: {
      rating: 4,
      reviewCount: 87,
      quote: 'Excellent food and atmosphere. Highly recommend for a nice evening out.'
    },
    allergens: [
      { name: 'Peanuts', icon: '🥜' },
      { name: 'Tree nuts', icon: '🌰' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: true
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 2,
    name: 'Sideshow Kitchen',
    image: 'https://source.unsplash.com/random/800x600/?restaurant,burger',
    cuisines: ['American', 'Burgers'],
    hours: 'Open until 10PM',
    phone: '(415) 555-1234',
    website: 'sideshowkitchen.com',
    address: '456 Market St, San Francisco, CA 94105',
    eatableReview: {
      rating: 4,
      reviewCount: 34,
      quote: 'Great gluten-free options and very knowledgeable about cross-contamination'
    },
    googleReview: {
      rating: 4,
      reviewCount: 65,
      quote: 'Delicious burgers and friendly staff. A bit pricey but worth it.'
    },
    allergens: [
      { name: 'Gluten', icon: '🌾' },
      { name: 'Dairy', icon: '🥛' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: false
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 3,
    name: 'Sakura Sushi',
    image: 'https://source.unsplash.com/random/800x600/?sushi,japanese',
    cuisines: ['Japanese', 'Sushi'],
    hours: 'Open until 9:30PM',
    phone: '(415) 555-8765',
    website: 'sakurasf.com',
    address: '789 Geary St, San Francisco, CA 94102',
    eatableReview: {
      rating: 4.5,
      reviewCount: 28,
      quote: 'They have a dedicated gluten-free menu and the staff is very knowledgeable about shellfish allergies'
    },
    googleReview: {
      rating: 4.3,
      reviewCount: 112,
      quote: 'Fresh fish and great service. One of the best sushi spots in the city.'
    },
    allergens: [
      { name: 'Shellfish', icon: '🦐' },
      { name: 'Gluten', icon: '🌾' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: true
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 4,
    name: 'Green Garden',
    image: 'https://source.unsplash.com/random/800x600/?vegan,restaurant',
    cuisines: ['Vegan', 'Vegetarian'],
    hours: 'Open until 8PM',
    phone: '(415) 555-2468',
    website: 'greengardensf.com',
    address: '321 Valencia St, San Francisco, CA 94103',
    eatableReview: {
      rating: 5,
      reviewCount: 56,
      quote: 'Perfect for dairy allergies, everything is plant-based and they are careful about nut allergies too'
    },
    googleReview: {
      rating: 4.7,
      reviewCount: 89,
      quote: 'Amazing vegan food that even non-vegans will love. Great atmosphere too.'
    },
    allergens: [
      { name: 'Dairy', icon: '🥛' },
      { name: 'Tree nuts', icon: '🌰' }
    ],
    accommodations: {
      chefAvailable: false,
      allergenMenu: true
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 5,
    name: 'Taco Fiesta',
    image: 'https://source.unsplash.com/random/800x600/?mexican,tacos',
    cuisines: ['Mexican', 'Tex-Mex'],
    hours: 'Open until 10PM',
    phone: '(415) 555-7890',
    website: 'tacofiestasf.com',
    address: '567 Mission St, San Francisco, CA 94105',
    eatableReview: {
      rating: 3.5,
      reviewCount: 23,
      quote: 'They can accommodate gluten-free diets but be careful about cross-contamination with corn'
    },
    googleReview: {
      rating: 4.2,
      reviewCount: 156,
      quote: 'Authentic Mexican flavors and great margaritas. The street tacos are a must-try.'
    },
    allergens: [
      { name: 'Gluten', icon: '🌾' },
      { name: 'Corn', icon: '🌽' }
    ],
    accommodations: {
      chefAvailable: false,
      allergenMenu: false
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 6,
    name: 'Pasta Paradise',
    image: 'https://source.unsplash.com/random/800x600/?italian,pasta',
    cuisines: ['Italian', 'Mediterranean'],
    hours: 'Open until 10:30PM',
    phone: '(415) 555-3456',
    website: 'pastaparadisesf.com',
    address: '789 Columbus Ave, San Francisco, CA 94133',
    eatableReview: {
      rating: 4.8,
      reviewCount: 45,
      quote: 'They have excellent gluten-free pasta options and the staff is very knowledgeable about celiac disease'
    },
    googleReview: {
      rating: 4.5,
      reviewCount: 132,
      quote: 'Authentic Italian cuisine with generous portions. The homemade pasta is incredible.'
    },
    allergens: [
      { name: 'Gluten', icon: '🌾' },
      { name: 'Dairy', icon: '🥛' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: true
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 7,
    name: 'Spice Route',
    image: 'https://source.unsplash.com/random/800x600/?indian,curry',
    cuisines: ['Indian', 'Pakistani'],
    hours: 'Open until 11PM',
    phone: '(415) 555-9876',
    website: 'spiceroutesf.com',
    address: '456 Valencia St, San Francisco, CA 94103',
    eatableReview: {
      rating: 4.2,
      reviewCount: 38,
      quote: 'Great for dairy allergies as they can make most dishes without cream or ghee'
    },
    googleReview: {
      rating: 4.4,
      reviewCount: 178,
      quote: 'Flavorful curries and excellent naan bread. The lamb vindaloo is outstanding.'
    },
    allergens: [
      { name: 'Dairy', icon: '🥛' },
      { name: 'Nuts', icon: '🌰' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: false
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 8,
    name: 'Ocean Breeze',
    image: 'https://source.unsplash.com/random/800x600/?seafood,restaurant',
    cuisines: ['Seafood', 'American'],
    hours: 'Open until 9:30PM',
    phone: '(415) 555-6543',
    website: 'oceanbreezeseafood.com',
    address: '123 Embarcadero, San Francisco, CA 94111',
    eatableReview: {
      rating: 4.6,
      reviewCount: 52,
      quote: 'They take shellfish allergies very seriously and have separate preparation areas'
    },
    googleReview: {
      rating: 4.3,
      reviewCount: 145,
      quote: 'Fresh seafood with a view of the bay. The clam chowder is a must-try.'
    },
    allergens: [
      { name: 'Shellfish', icon: '🦐' },
      { name: 'Fish', icon: '🐟' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: true
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 9,
    name: 'Golden Dragon',
    image: 'https://source.unsplash.com/random/800x600/?chinese,restaurant',
    cuisines: ['Chinese', 'Dim Sum'],
    hours: 'Open until 10PM',
    phone: '(415) 555-8765',
    website: 'goldendragonsf.com',
    address: '789 Grant Ave, San Francisco, CA 94108',
    eatableReview: {
      rating: 3.8,
      reviewCount: 29,
      quote: 'They can accommodate soy allergies but be careful about cross-contamination'
    },
    googleReview: {
      rating: 4.1,
      reviewCount: 210,
      quote: 'Authentic dim sum and great service. The xiao long bao is exceptional.'
    },
    allergens: [
      { name: 'Soy', icon: '🫘' },
      { name: 'Gluten', icon: '🌾' }
    ],
    accommodations: {
      chefAvailable: false,
      allergenMenu: false
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  },
  {
    id: 10,
    name: 'Burger Bliss',
    image: 'https://source.unsplash.com/random/800x600/?burger,restaurant',
    cuisines: ['American', 'Burgers'],
    hours: 'Open until 11PM',
    phone: '(415) 555-2345',
    website: 'burgerblisssf.com',
    address: '456 Haight St, San Francisco, CA 94117',
    eatableReview: {
      rating: 4.7,
      reviewCount: 63,
      quote: 'They have excellent gluten-free buns and a dedicated fryer for allergen-free fries'
    },
    googleReview: {
      rating: 4.6,
      reviewCount: 189,
      quote: 'Best burgers in the city. The truffle fries are amazing too.'
    },
    allergens: [
      { name: 'Gluten', icon: '🌾' },
      { name: 'Dairy', icon: '🥛' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: true
    },
    lat: 37.7749 + (Math.random() - 0.5) * 0.03,
    lng: -122.4194 + (Math.random() - 0.5) * 0.03,
  }
];

// Mock API service
const restaurantService = {
  // Get restaurants with pagination
  getRestaurants: async (page = 1, limit = 5) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('getRestaurants called with page:', page, 'limit:', limit);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = sampleRestaurants.slice(startIndex, endIndex);
    
    // Log the results for debugging
    console.log('Restaurant service returning:', {
      restaurants: paginatedResults,
      totalCount: sampleRestaurants.length,
      hasMore: endIndex < sampleRestaurants.length,
      startIndex,
      endIndex
    });
    
    return {
      restaurants: paginatedResults,
      totalCount: sampleRestaurants.length,
      hasMore: endIndex < sampleRestaurants.length
    };
  },
  
  // Get a single restaurant by ID
  getRestaurantById: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const restaurant = sampleRestaurants.find(r => r.id === parseInt(id));
    return restaurant || null;
  },
  
  // Search restaurants by query
  searchRestaurants: async (query, page = 1, limit = 5) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const filteredRestaurants = sampleRestaurants.filter(restaurant => {
      const searchTerm = query.toLowerCase();
      return (
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisines.some(cuisine => cuisine.toLowerCase().includes(searchTerm)) ||
        (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm))
      );
    });
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredRestaurants.slice(startIndex, endIndex);
    
    return {
      restaurants: paginatedResults,
      totalCount: filteredRestaurants.length,
      hasMore: endIndex < filteredRestaurants.length
    };
  }
};

export default restaurantService; 