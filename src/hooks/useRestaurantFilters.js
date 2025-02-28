import { useState, useMemo } from 'react';

export function useRestaurantFilters(restaurants) {
  const [sortBy, setSortBy] = useState('rating_high');
  const [priceFilter, setPriceFilter] = useState('all');
  const [cuisineType, setCuisineType] = useState('all');

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Apply price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(r => r.price_level === Number(priceFilter));
    }

    // Apply cuisine filter
    if (cuisineType !== 'all') {
      filtered = filtered.filter(r => r.types.includes(cuisineType));
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating_high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.user_ratings_total - a.user_ratings_total);
        break;
      default:
        break;
    }

    return filtered;
  }, [restaurants, sortBy, priceFilter, cuisineType]);

  return {
    sortBy,
    setSortBy,
    priceFilter,
    setPriceFilter,
    cuisineType,
    setCuisineType,
    filteredRestaurants
  };
} 