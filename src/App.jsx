import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<SearchPage />} />
        <Route path="/restaurants/search" element={<SearchPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App; 