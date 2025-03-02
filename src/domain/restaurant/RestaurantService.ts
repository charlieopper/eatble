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
} 