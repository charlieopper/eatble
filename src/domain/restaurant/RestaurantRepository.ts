export interface RestaurantRepository {
  findById(id: string): Promise<Restaurant>;
  findByLocation(lat: number, lng: number, radius: number): Promise<Restaurant[]>;
  save(restaurant: Restaurant): Promise<void>;
  update(restaurant: Restaurant): Promise<void>;
  delete(id: string): Promise<void>;
} 