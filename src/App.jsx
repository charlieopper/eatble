import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FavoritesProvider } from './context/FavoritesContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import ReviewsPage from './pages/ReviewsPage';
import ErrorBoundary from './components/ErrorBoundary';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';

function App() {
  return (
    <FavoritesProvider>
      <Toaster position="top-center" />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<SearchPage />} />
          <Route path="/restaurants/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
        </Routes>
      </ErrorBoundary>
    </FavoritesProvider>
  );
}

export default App; 