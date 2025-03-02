import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Search, Filter, List, Map as MapIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LocationSearch from '../components/search/LocationSearch';
import RestaurantList from '../components/restaurants/RestaurantList';
import RestaurantDetailModal from '../components/restaurants/RestaurantDetailModal';
import MapView from '../components/map/MapView';
import Footer from '../components/layout/Footer';
import restaurantService from '../services/restaurantService';
import googleLogo from '../assets/google-g-logo.png';

export default function SearchPage() {
  const location = useLocation();
  const initialState = location.state || {};
  const sentinelRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState(initialState.location || null);
  const [selectedAllergens, setSelectedAllergens] = useState(initialState.allergens || []);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRestaurantDetail, setSelectedRestaurantDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Highest Rated');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showManualLoadMore, setShowManualLoadMore] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Function to load initial restaurants
  const loadRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await restaurantService.getRestaurants(1, 3); // Load fewer initially for testing
      console.log('Initial load result:', result);
      
      // Ensure each restaurant has coordinates
      const restaurantsWithCoords = result.restaurants.map(restaurant => {
        // If restaurant already has coordinates, use them
        if (restaurant.lat && restaurant.lng) {
          return restaurant;
        }
        
        // Otherwise, generate random coordinates around San Francisco
        const lat = 37.7749 + (Math.random() - 0.5) * 0.05;
        const lng = -122.4194 + (Math.random() - 0.5) * 0.05;
        
        return {
          ...restaurant,
          lat,
          lng
        };
      });
      
      setRestaurants(restaurantsWithCoords);
      setHasMore(result.hasMore);
      setPage(1);
      
      console.log('Restaurants with coordinates:', restaurantsWithCoords);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to load more restaurants when scrolling
  const loadMoreRestaurants = async () => {
    console.log('loadMoreRestaurants called', { isLoadingMore, hasMore, page });
    
    if (isLoadingMore || !hasMore) {
      console.log('Skipping loadMoreRestaurants', { isLoadingMore, hasMore });
      return;
    }
    
    setIsLoadingMore(true);
    setShowManualLoadMore(false);
    console.log('Loading more restaurants, page:', page + 1);
    
    try {
      const nextPage = page + 1;
      const result = searchQuery 
        ? await restaurantService.searchRestaurants(searchQuery, nextPage, 3)
        : await restaurantService.getRestaurants(nextPage, 3);
      
      console.log('Got more restaurants:', result);
      
      if (result.restaurants && result.restaurants.length > 0) {
        // Add coordinates to new restaurants
        const newRestaurantsWithCoords = result.restaurants.map(restaurant => {
          if (restaurant.lat && restaurant.lng) {
            return restaurant;
          }
          
          const lat = 37.7749 + (Math.random() - 0.5) * 0.05;
          const lng = -122.4194 + (Math.random() - 0.5) * 0.05;
          
          return {
            ...restaurant,
            lat,
            lng
          };
        });
        
        setRestaurants(prevRestaurants => [...prevRestaurants, ...newRestaurantsWithCoords]);
        setPage(nextPage);
        setHasMore(result.hasMore);
        console.log('Updated state with new restaurants with coordinates');
      } else {
        console.log('No more restaurants returned');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more restaurants:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Function to handle search
  const handleSearch = useCallback(async (query) => {
    setIsLoading(true);
    try {
      const result = await restaurantService.searchRestaurants(query, 1, 5);
      
      // Ensure each restaurant has coordinates
      const restaurantsWithCoords = result.restaurants.map(restaurant => {
        // If restaurant already has coordinates, use them
        if (restaurant.lat && restaurant.lng) {
          return restaurant;
        }
        
        // Otherwise, generate random coordinates around San Francisco
        const lat = 37.7749 + (Math.random() - 0.5) * 0.05;
        const lng = -122.4194 + (Math.random() - 0.5) * 0.05;
        
        return {
          ...restaurant,
          lat,
          lng
        };
      });
      
      setRestaurants(restaurantsWithCoords);
      setHasMore(result.hasMore);
      setPage(1);
      
      console.log('Search results with coordinates:', restaurantsWithCoords);
    } catch (error) {
      console.error('Error searching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial restaurants
  useEffect(() => {
    loadRestaurants();
    
    // Add CSS animation for spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [loadRestaurants]);

  // Handle search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        loadRestaurants();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch, loadRestaurants]);

  // Update the useEffect for infinite scrolling to reset the manual button state
  useEffect(() => {
    // Only set up the observer if we have more restaurants to load
    if (!hasMore || isLoading) {
      setShowManualLoadMore(false);
      return;
    }
    
    console.log('Setting up Intersection Observer with hasMore:', hasMore);
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log('Intersection detected:', entry.isIntersecting, 'hasMore:', hasMore);
        
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          console.log('Triggering loadMoreRestaurants');
          loadMoreRestaurants();
          setShowManualLoadMore(false); // Hide manual button when infinite scroll works
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    
    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
      console.log('Observing sentinel element');
    }
    
    // Set a timeout to show the manual button if infinite scroll doesn't trigger
    const timeoutId = setTimeout(() => {
      if (hasMore && !isLoadingMore) {
        setShowManualLoadMore(true);
      }
    }, 3000); // Show manual button after 3 seconds if infinite scroll doesn't work
    
    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
        console.log('Unobserving sentinel element');
      }
      clearTimeout(timeoutId);
    };
  }, [hasMore, isLoading, isLoadingMore, loadMoreRestaurants]);

  // Add coordinates to restaurants for map view
  useEffect(() => {
    // This is a mock implementation - in a real app, you'd get coordinates from your API
    if (restaurants.length > 0) {
      const restaurantsWithCoords = restaurants.map((restaurant, index) => {
        // Generate random coordinates around San Francisco for demo
        const lat = 37.7749 + (Math.random() - 0.5) * 0.05;
        const lng = -122.4194 + (Math.random() - 0.5) * 0.05;
        
        return {
          ...restaurant,
          lat,
          lng
        };
      });
      
      setRestaurants(restaurantsWithCoords);
    }
  }, []);

  const renderGoogleReviewBadge = (restaurant) => {
    return (
      <div className="google-review-badge">
        <div className="google-badge-header">
          <img 
            src={googleLogo} 
            alt="Google" 
            className="google-g-logo" 
            width="16" 
            height="16" 
          />
          <span>Google Review</span>
          <div className="stars">
            {/* Stars rendering */}
          </div>
          <span>({restaurant.user_ratings_total})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px',
        borderBottom: '1px solid #eaeaea'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 'bold', fontSize: 'clamp(16px, 4vw, 20px)' }}>
              eat<span style={{ color: '#e53e3e' }}>ABLE</span>
              <span style={{ marginLeft: '4px' }}>🍴</span>
            </span>
          </Link>
          <div>
            <button 
              style={{ 
                marginRight: '15px', 
                background: 'none',
                border: 'none',
                color: 'black',
                fontSize: 'clamp(12px, 3vw, 14px)',
                cursor: 'pointer'
              }}
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </button>
            <button 
              style={{ 
                backgroundColor: '#1e40af',
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '4px', 
                border: 'none',
                fontSize: 'clamp(12px, 3vw, 14px)',
                cursor: 'pointer'
              }}
              onClick={() => setShowRegisterModal(true)}
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main style={{ padding: '16px' }}>
        {/* Location Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center'
          }}>
            <MapPin size={20} style={{ marginRight: '8px', color: '#6b7280' }} />
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: 0,
              padding: 0
            }}>
              {selectedLocation ? selectedLocation.description : 'San Francisco, CA'}
            </h2>
          </div>
          
          {/* Toggle between list and map views */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '2px'
          }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: viewMode === 'list' ? '#1e40af' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#4b5563',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: viewMode === 'map' ? '#1e40af' : 'transparent',
                color: viewMode === 'map' ? 'white' : '#4b5563',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <MapIcon size={16} />
              Map
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px 0', marginBottom: '24px' }}>
          <tbody>
            <tr>
              <td style={{ width: '55%', paddingRight: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    width: '20px',
                    height: '20px'
                  }} />
                  <input
                    type="text"
                    placeholder="Search restaurants or cuisines"
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </td>
              <td style={{ width: '35%', paddingRight: '10px' }}>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    appearance: 'auto',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="Highest Rated">Highest Rated</option>
                  <option value="Distance">Distance</option>
                  <option value="Most Reviews">Most Reviews</option>
                </select>
              </td>
              <td style={{ width: '10%' }}>
                <button style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}>
                  <Filter size={20} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* View Mode Content */}
        {viewMode === 'list' ? (
          // List View
          <>
            <RestaurantList 
              restaurants={restaurants} 
              isLoading={isLoading}
              onSelectRestaurant={setSelectedRestaurantDetail}
            />

            {/* Infinite Scroll Sentinel */}
            <div 
              ref={sentinelRef}
              style={{ 
                height: '20px',
                margin: '20px 0',
                opacity: isLoadingMore ? 1 : 0,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              {isLoadingMore && (
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '3px solid rgba(0, 0, 0, 0.1)', 
                  borderLeftColor: '#3b82f6', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              )}
            </div>

            {/* Manual Load More Button */}
            {hasMore && !isLoading && !isLoadingMore && showManualLoadMore && (
              <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                margin: '20px 0'
              }}>
                <button
                  onClick={() => {
                    console.log('Manual load more clicked');
                    loadMoreRestaurants();
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Load More Restaurants
                </button>
              </div>
            )}
          </>
        ) : (
          // Map View
          <div style={{ height: 'calc(100vh - 250px)', marginBottom: '20px' }}>
            {isLoading ? (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '4px solid rgba(0, 0, 0, 0.1)', 
                  borderLeftColor: '#3b82f6', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              </div>
            ) : (
              <MapView 
                restaurants={restaurants}
                onSelectRestaurant={setSelectedRestaurantDetail}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer activePage="Search" />

      {/* Restaurant Detail Modal */}
      {selectedRestaurantDetail && (
        <RestaurantDetailModal
          restaurant={selectedRestaurantDetail}
          onClose={() => setSelectedRestaurantDetail(null)}
        />
      )}
    </div>
  );
}