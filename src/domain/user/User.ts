export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  location?: string;
  joinDate: Date;
  allergens: string[];
  favoriteRestaurants: string[];
  reviewCount: number;
  connectionCount: number;
} 