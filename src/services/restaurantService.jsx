// Sample restaurant data with more variety
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
    }
  },
  // Other restaurant data remains the same...
];

// Mock API service
const restaurantService = {
  // Get restaurants with pagination
  getRestaurants: async (page = 1, limit = 5) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = sampleRestaurants.slice(startIndex, endIndex);
    
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