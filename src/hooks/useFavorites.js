import { useState } from 'react';
import { toast } from 'react-hot-toast';

// Temporary version that works without Firebase
export function useFavorites(restaurantId) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  return { isFavorite, toggleFavorite };
} 