export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  username: string;
  date: Date;
  rating: number;
  allergenData: {
    chefManagerAvailable: boolean;
    allergenMenuAvailable: boolean;
  };
  reviewText: string;
  userAllergens: string[];
  helpfulCount: number;
} 