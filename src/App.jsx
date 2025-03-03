import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FavoritesProvider } from './context/FavoritesContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import ErrorBoundary from './components/ErrorBoundary';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';

function App() {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    
    // Load Google Maps API
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      setGoogleMapsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script if component unmounts before loading
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return (
    <FavoritesProvider>
      <Toaster position="top-center" />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<SearchPage />} />
          <Route path="/restaurants/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
        </Routes>
      </ErrorBoundary>
    </FavoritesProvider>
  );
}

export default App; 