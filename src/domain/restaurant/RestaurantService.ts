export class RestaurantService {
  constructor(private repository: RestaurantRepository) {}

  async findAllergenFriendlyRestaurants(
    allergens: string[],
    location: GeoLocation,
    radius: number
  ): Promise<Restaurant[]> {
    const restaurants = await this.repository.findByLocation(
      location.lat,
      location.lng,
      radius
    );
    
    return restaurants.filter(restaurant => 
      restaurant.allergenAccommodations.allergenMenuAvailable ||
      restaurant.allergenAccommodations.chefManagerAvailable
    );
  }

  async calculateAllergenRatings(restaurantId: string): Promise<Record<string, {count: number, average: number}>> {
    const reviews = await this.repository.findReviewsByRestaurantId(restaurantId);
    
    const allergenRatings: Record<string, {count: number, total: number, average: number}> = {};
    
    reviews.forEach(review => {
      if (!review.userAllergens || !review.userAllergens.length) return;
      
      review.userAllergens.forEach(allergen => {
        if (!allergenRatings[allergen]) {
          allergenRatings[allergen] = {
            count: 0,
            total: 0,
            average: 0
          };
        }
        
        allergenRatings[allergen].count += 1;
        allergenRatings[allergen].total += review.rating;
        allergenRatings[allergen].average = 
          allergenRatings[allergen].total / allergenRatings[allergen].count;
      });
    });
    
    // Clean up the object to only include count and average
    Object.keys(allergenRatings).forEach(allergen => {
      delete allergenRatings[allergen].total;
      // Round average to 1 decimal place
      allergenRatings[allergen].average = 
        Math.round(allergenRatings[allergen].average * 10) / 10;
    });
    
    return allergenRatings;
  }
} 