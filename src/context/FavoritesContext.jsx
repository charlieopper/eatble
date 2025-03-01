import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Create the context
const FavoritesContext = createContext();

// Custom hook to use the favorites context
export const useFavorites = () => {
  return useContext(FavoritesContext);
};

// Safe localStorage functions
const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
};

// Provider component
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const loadFavorites = () => {
      const storedFavorites = safeGetItem('favorites');
      if (storedFavorites) {
        try {
          setFavorites(JSON.parse(storedFavorites));
        } catch (e) {
          console.error('Error parsing favorites from localStorage:', e);
        }
      }
      setIsInitialized(true);
    };

    // Delay loading to ensure we're in a browser context
    if (typeof window !== 'undefined') {
      loadFavorites();
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      safeSetItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, isInitialized]);

  // Add a restaurant to favorites
  const addFavorite = (restaurant) => {
    setFavorites((prevFavorites) => {
      // Check if restaurant is already in favorites
      if (!prevFavorites.some(fav => fav.id === restaurant.id)) {
        toast.success('Added to favorites');
        return [...prevFavorites, restaurant];
      }
      return prevFavorites;
    });
  };

  // Remove a restaurant from favorites
  const removeFavorite = (restaurantId) => {
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.filter(restaurant => restaurant.id !== restaurantId);
      if (newFavorites.length < prevFavorites.length) {
        toast.success('Removed from favorites');
      }
      return newFavorites;
    });
  };

  // Check if a restaurant is in favorites
  const isFavorite = (restaurantId) => {
    return favorites.some(restaurant => restaurant.id === restaurantId);
  };

  // Toggle favorite status
  const toggleFavorite = (restaurant) => {
    if (isFavorite(restaurant.id)) {
      removeFavorite(restaurant.id);
    } else {
      addFavorite(restaurant);
    }
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}; 