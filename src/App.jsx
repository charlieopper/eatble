import React, { useEffect, useState } from 'react';
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

const loadGoogleMapsScript = () => {
  if (window.google) return Promise.resolve();
  
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

function App() {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        console.log('Google Maps API loaded successfully');
        setGoogleMapsLoaded(true);
      })
      .catch(err => {
        console.error('Error loading Google Maps API:', err);
      });
  }, []);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <ReviewsProvider>
            <Toaster position="top-center" />
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
          </ReviewsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 