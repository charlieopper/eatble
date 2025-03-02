// Mock restaurant data for UI development
export const mockRestaurants = [
  {
    place_id: "mock-1",
    name: "The Italian Bistro",
    rating: 4.7,
    user_ratings_total: 342,
    eatableRating: 4.9,
    types: ["italian_restaurant", "restaurant"],
    price_level: 3,
    opening_hours: {
      open_now: true,
      periods: [{ close: { time: "2200" } }],
      weekday_text: [
        "Monday: 11:00 AM – 10:00 PM",
        "Tuesday: 11:00 AM – 10:00 PM",
        "Wednesday: 11:00 AM – 10:00 PM",
        "Thursday: 11:00 AM – 10:00 PM",
        "Friday: 11:00 AM – 11:00 PM",
        "Saturday: 11:00 AM – 11:00 PM",
        "Sunday: 12:00 PM – 9:00 PM"
      ]
    },
    formatted_phone_number: "(555) 123-4567",
    formatted_address: "123 Main St, Anytown, USA",
    website: "https://italianbistronyc.com",
    eatableReviews: [
      {
        id: "review-1",
        user: "FoodLover123",
        rating: 5,
        text: "Amazing pasta and gluten-free options!",
        date: "2023-05-15T12:00:00Z",
        allergens: ["Gluten", "Dairy"]
      },
      {
        id: "review-2",
        user: "PastaFan",
        rating: 4,
        text: "Great food but be careful if you have nut allergies.",
        date: "2023-06-20T14:30:00Z",
        allergens: ["Tree Nuts", "Dairy"]
      }
    ],
    allergens: [
      { 
        name: "Gluten", 
        icon: "🌾", 
        rating: { count: 2, average: 4.5 } 
      },
      { 
        name: "Dairy", 
        icon: "🥛", 
        rating: { count: 3, average: 3.7 } 
      }
    ]
  },
  {
    place_id: "mock-2",
    name: "Sushi Paradise",
    rating: 4.5,
    user_ratings_total: 256,
    eatableRating: 4.2,
    types: ["japanese_restaurant", "sushi", "restaurant"],
    price_level: 2,
    opening_hours: {
      open_now: true,
      periods: [{ close: { time: "2300" } }],
      weekday_text: [
        "Monday: 11:30 AM – 11:00 PM",
        "Tuesday: 11:30 AM – 11:00 PM",
        "Wednesday: 11:30 AM – 11:00 PM",
        "Thursday: 11:30 AM – 11:00 PM",
        "Friday: 11:30 AM – 12:00 AM",
        "Saturday: 12:00 PM – 12:00 AM",
        "Sunday: 12:00 PM – 10:00 PM"
      ]
    },
    formatted_phone_number: "(555) 987-6543",
    formatted_address: "456 Ocean Ave, Beachtown, USA",
    website: "https://sushiparadise.com",
    eatableReviews: [
      {
        id: "review-3",
        user: "SushiLover",
        rating: 5,
        text: "Best sushi in town! They're very careful with seafood allergies.",
        date: "2023-07-10T18:45:00Z",
        allergens: ["Fish", "Shellfish"]
      }
    ],
    allergens: [
      { 
        name: "Gluten", 
        icon: "🌾", 
        rating: { count: 2, average: 4.5 } 
      },
      { 
        name: "Dairy", 
        icon: "🥛", 
        rating: { count: 3, average: 3.7 } 
      }
    ]
  },
  {
    place_id: "mock-3",
    name: "Taco Fiesta",
    rating: 4.2,
    user_ratings_total: 189,
    eatableRating: 4.5,
    types: ["mexican_restaurant", "restaurant"],
    price_level: 1,
    opening_hours: {
      open_now: false,
      periods: [{ close: { time: "2100" } }],
      weekday_text: [
        "Monday: 10:00 AM – 9:00 PM",
        "Tuesday: 10:00 AM – 9:00 PM",
        "Wednesday: 10:00 AM – 9:00 PM",
        "Thursday: 10:00 AM – 9:00 PM",
        "Friday: 10:00 AM – 10:00 PM",
        "Saturday: 11:00 AM – 10:00 PM",
        "Sunday: 11:00 AM – 8:00 PM"
      ]
    },
    formatted_phone_number: "(555) 789-0123",
    formatted_address: "789 Spice St, Flavortown, USA",
    website: "https://tacofiesta.com",
    eatableReviews: [
      {
        id: "review-4",
        user: "MexicanFoodFan",
        rating: 4,
        text: "Great tacos and they have corn tortillas for gluten-free folks!",
        date: "2023-04-05T19:20:00Z",
        allergens: ["Gluten"]
      },
      {
        id: "review-5",
        user: "SpicyFoodLover",
        rating: 5,
        text: "Amazing flavors and they're careful about peanut allergies.",
        date: "2023-05-12T13:15:00Z",
        allergens: ["Peanuts"]
      }
    ],
    allergens: [
      { 
        name: "Gluten", 
        icon: "🌾", 
        rating: { count: 2, average: 4.5 } 
      },
      { 
        name: "Dairy", 
        icon: "🥛", 
        rating: { count: 3, average: 3.7 } 
      }
    ]
  },
  {
    place_id: "mock-4",
    name: "Burger Joint",
    rating: 4.0,
    user_ratings_total: 421,
    eatableRating: 3.8,
    types: ["burger_restaurant", "restaurant"],
    price_level: 2,
    opening_hours: {
      open_now: true,
      periods: [{ close: { time: "2200" } }],
      weekday_text: [
        "Monday: 11:00 AM – 10:00 PM",
        "Tuesday: 11:00 AM – 10:00 PM",
        "Wednesday: 11:00 AM – 10:00 PM",
        "Thursday: 11:00 AM – 10:00 PM",
        "Friday: 11:00 AM – 11:00 PM",
        "Saturday: 11:00 AM – 11:00 PM",
        "Sunday: 12:00 PM – 9:00 PM"
      ]
    },
    formatted_phone_number: "(555) 456-7890",
    formatted_address: "101 Burger Blvd, Pattyville, USA",
    website: "https://burgerjoint.com",
    eatableReviews: [
      {
        id: "review-6",
        user: "BurgerFanatic",
        rating: 4,
        text: "Great burgers but the buns contain sesame.",
        date: "2023-03-22T17:30:00Z",
        allergens: ["Sesame", "Gluten"]
      }
    ],
    allergens: [
      { 
        name: "Gluten", 
        icon: "🌾", 
        rating: { count: 2, average: 4.5 } 
      },
      { 
        name: "Dairy", 
        icon: "🥛", 
        rating: { count: 3, average: 3.7 } 
      }
    ]
  },
  {
    place_id: "mock-5",
    name: "Veggie Delight",
    rating: 4.6,
    user_ratings_total: 178,
    eatableRating: 4.7,
    types: ["vegan_restaurant", "vegetarian_restaurant", "restaurant"],
    price_level: 2,
    opening_hours: {
      open_now: true,
      periods: [{ close: { time: "2100" } }],
      weekday_text: [
        "Monday: 10:00 AM – 9:00 PM",
        "Tuesday: 10:00 AM – 9:00 PM",
        "Wednesday: 10:00 AM – 9:00 PM",
        "Thursday: 10:00 AM – 9:00 PM",
        "Friday: 10:00 AM – 9:00 PM",
        "Saturday: 10:00 AM – 9:00 PM",
        "Sunday: 11:00 AM – 8:00 PM"
      ]
    },
    formatted_phone_number: "(555) 234-5678",
    formatted_address: "202 Green St, Veggington, USA",
    website: "https://veggiedelight.com",
    eatableReviews: [
      {
        id: "review-7",
        user: "VeganFoodie",
        rating: 5,
        text: "Amazing plant-based options and they're very allergen-conscious!",
        date: "2023-06-18T12:45:00Z",
        allergens: ["Tree Nuts", "Soy"]
      },
      {
        id: "review-8",
        user: "HealthyEater",
        rating: 4,
        text: "Great food but some dishes contain wheat.",
        date: "2023-07-05T13:20:00Z",
        allergens: ["Wheat", "Gluten"]
      }
    ],
    allergens: [
      { 
        name: "Gluten", 
        icon: "🌾", 
        rating: { count: 2, average: 4.5 } 
      },
      { 
        name: "Dairy", 
        icon: "🥛", 
        rating: { count: 3, average: 3.7 } 
      }
    ]
  },
  {
    place_id: "mock-6",
    name: "Pizza Palace",
    rating: 4.3,
    user_ratings_total: 312,
    eatableRating: 4.1,
    types: ["pizza_restaurant", "italian_restaurant", "restaurant"],
    price_level: 2,
    opening_hours: {
      open_now: true,
      periods: [{ close: { time: "2300" } }],
      weekday_text: [
        "Monday: 11:00 AM – 11:00 PM",
        "Tuesday: 11:00 AM – 11:00 PM",
        "Wednesday: 11:00 AM – 11:00 PM",
        "Thursday: 11:00 AM – 11:00 PM",
        "Friday: 11:00 AM – 12:00 AM",
        "Saturday: 11:00 AM – 12:00 AM",
        "Sunday: 12:00 PM – 10:00 PM"
      ]
    },
    formatted_phone_number: "(555) 876-5432",
    formatted_address: "303 Pizza Way, Cheesetown, USA",
    website: "https://pizzapalace.com",
    eatableReviews: [
      {
        id: "review-9",
        user: "PizzaLover",
        rating: 4,
        text: "Great pizza but be careful if you have dairy allergies.",
        date: "2023-05-30T19:15:00Z",
        allergens: ["Dairy", "Gluten"]
      }
    ],
    allergens: [
      { 
        name: "Gluten", 
        icon: "🌾", 
        rating: { count: 2, average: 4.5 } 
      },
      { 
        name: "Dairy", 
        icon: "🥛", 
        rating: { count: 3, average: 3.7 } 
      }
    ]
  }
];

// Add mock photos to each restaurant
mockRestaurants.forEach((restaurant, index) => {
  // Use static image URLs instead of functions
  restaurant.photos = [
    {
      // Use a static placeholder image
      getUrl: function() {
        return `https://placehold.co/400x300/orange/white?text=${encodeURIComponent(restaurant.name)}`;
      }
    }
  ];
  
  // Fix: Use static lat/lng objects instead of functions
  const lat = 40.7128 + (Math.random() - 0.5) * 0.1;
  const lng = -74.0060 + (Math.random() - 0.5) * 0.1;
  
  restaurant.geometry = {
    location: {
      lat: lat,
      lng: lng,
      // Add these methods for compatibility
      lat: function() { return lat; },
      lng: function() { return lng; }
    }
  };
});

export default mockRestaurants; 