import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import ErrorBoundary from './components/ErrorBoundary';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import ReviewsPage from './pages/ReviewsPage';
import AuthTest from './components/auth/AuthTest';
import ProfilePage from './pages/ProfilePage';
import { ReviewsProvider } from './context/ReviewsContext';

function App() {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  useEffect(() => {
    // If Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      window.googleMapsLoaded = true;
      setGoogleMapsLoaded(true);
      return;
    }

    // Function to load the Google Maps script
    const loadGoogleMapsScript = () => {
      const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
      
      // Create script element
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      // Set up callbacks
      script.onload = () => {
        // Wait a moment to ensure Places library is initialized
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            window.googleMapsLoaded = true;
            setGoogleMapsLoaded(true);
          } else {
            console.error('[GoogleMaps] API loaded but Places library not available');
          }
        }, 500);
      };
      
      script.onerror = () => {
        console.error('[GoogleMaps] Script loading failed');
      };
      
      // Add script to document
      document.head.appendChild(script);
    };

    // Check if script is already in the document
    if (!document.getElementById('google-maps-script')) {
      loadGoogleMapsScript();
    }
  }, []);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <ReviewsProvider>
            <Toaster position="top-center" />
            {googleMapsLoaded ? (
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants" element={<SearchPage />} />
                <Route path="/restaurants/search" element={<SearchPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/auth-test" element={<AuthTest />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            ) : (
              <div className="loading-container">
                <div className="loading-message">
                  <h2>Loading Maps...</h2>
                  <p>Please wait while we initialize the map service.</p>
                </div>
              </div>
            )}
          </ReviewsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 