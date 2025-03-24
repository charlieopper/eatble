import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Create the context
const FavoritesContext = createContext();

// Custom hook to use the favorites context
export function useFavorites() {
  return useContext(FavoritesContext);
}

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
export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  
  // Add debugging
  useEffect(() => {
    if (user) {
      console.log('[Favorites Debug]:', { 
        action: 'user_loaded', 
        uid: user.uid,
        isNewUser: user.metadata?.creationTime === user.metadata?.lastSignInTime
      });
    }
  }, [user]);

  const getFavorites = async () => {
    console.log('[FavoritesContext] getFavorites called:', { 
      hasUser: Boolean(user),
      userId: user?.uid 
    });

    if (!user?.uid) {
      console.log('[FavoritesContext] No user, returning empty array');
      return [];
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      console.log('[FavoritesContext] Firestore response:', {
        exists: docSnap.exists(),
        data: docSnap.exists() ? 'has data' : 'no data'
      });

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const favoritesData = userData.favoriteRestaurants || [];
        console.log('[FavoritesContext] Got favorites:', favoritesData?.length);
        return favoritesData;
      }

      console.log('[FavoritesContext] No user doc found');
      return [];
    } catch (error) {
      console.error('[FavoritesContext] Error in getFavorites:', error);
      throw error; // Let the component handle the error
    }
  };

  // Load favorites when user changes
  useEffect(() => {
    console.log('[FavoritesContext] User changed:', user?.uid);
    if (user?.uid) {
      getFavorites()
        .then(favs => {
          console.log('[FavoritesContext] Setting favorites:', favs?.length);
          setFavorites(favs);
        })
        .catch(error => {
          console.error('[FavoritesContext] Error loading favorites:', error);
        });
    } else {
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = async (restaurant) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Check if this restaurant is already a favorite
      const isFav = favorites.some(fav => fav.id === restaurant.id);
      
      console.log('[Favorites Debug]:', { 
        action: 'toggle_favorite', 
        restaurantId: restaurant.id,
        currentlyFavorite: isFav
      });
      
      if (isFav) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(fav => fav.id !== restaurant.id);
        
        // Update Firestore
        await updateDoc(userDocRef, {
          favoriteRestaurants: updatedFavorites
        });
        
        // Update local state
        setFavorites(updatedFavorites);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites - prepare restaurant data
        const favoriteData = {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          rating: restaurant.rating,
          photos: restaurant.photos?.slice(0, 1) || [],
          cuisines: restaurant.cuisines || [],
          price_level: restaurant.price_level,
          website: restaurant.website || '',
          eatableReview: restaurant.eatableReview || null
        };
        
        // Create new array with the new favorite
        const updatedFavorites = [...favorites, favoriteData];
        
        console.log('[Favorites Debug]:', { 
          action: 'adding_favorite', 
          favoriteData
        });
        
        // Update Firestore
        await updateDoc(userDocRef, {
          favoriteRestaurants: updatedFavorites
        });
        
        // Update local state
        setFavorites(updatedFavorites);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Add a function to force refresh favorites from Firestore
  const refreshFavorites = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const firestoreFavorites = await getFavorites();
      setFavorites(firestoreFavorites);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Favorites]:', {
          action: 'refresh',
          count: firestoreFavorites.length
        });
      }
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      toggleFavorite, 
      isFavorite: (restaurantId) => favorites.some(fav => fav.id === restaurantId),
      refreshFavorites,
      getFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
} 