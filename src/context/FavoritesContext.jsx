import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Create the context
export const FavoritesContext = createContext();

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
  const { user } = useAuth();

  // Load favorites whenever user or favorites change
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const firestoreFavorites = userDoc.data()?.favoriteRestaurants || [];
        
        // Ensure local state matches Firestore
        setFavorites(firestoreFavorites);
        
        console.log('Loaded favorites from Firestore:', firestoreFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
        toast.error('Failed to load favorites');
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (restaurant) => {
    if (!user) {
      toast.error('Please login to favorite restaurants');
      return;
    }

    const isFavorited = favorites.some(fav => fav.id === restaurant.id);
    
    try {
      // Update Firestore first
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favoriteRestaurants: isFavorited
          ? arrayRemove(restaurant)
          : arrayUnion(restaurant)
      });

      // Then update local state after successful Firestore update
      setFavorites(prev => 
        isFavorited 
          ? prev.filter(fav => fav.id !== restaurant.id)
          : [...prev, restaurant]
      );

      console.log('Updated favorites:', isFavorited ? 'removed' : 'added', restaurant.id);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites');
    }
  };

  const isFavorite = (restaurantId) => {
    return favorites.some(fav => fav.id === restaurantId);
  };

  // Add a function to force refresh favorites from Firestore
  const refreshFavorites = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const firestoreFavorites = userDoc.data()?.favoriteRestaurants || [];
      setFavorites(firestoreFavorites);
      console.log('Refreshed favorites from Firestore:', firestoreFavorites);
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      toggleFavorite, 
      isFavorite,
      refreshFavorites // Expose refresh function
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}; 