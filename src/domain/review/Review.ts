export interface Review {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  userName: string;
  date: string;
  rating: number;
  text: string;
  allergens: string[];
  accommodations: {
    chefAvailable: boolean;
    allergenMenu: boolean;
  };
  helpfulCount: number;
} 