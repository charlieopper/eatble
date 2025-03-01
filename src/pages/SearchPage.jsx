import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Filter, Home, Star, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LocationSearch from '../components/search/LocationSearch';
import RestaurantList from '../components/restaurants/RestaurantList';
import RestaurantDetailModal from '../components/restaurants/RestaurantDetailModal';
import Footer from '../components/layout/Footer';

const sampleRestaurants = [
  {
    id: 1,
    name: 'Zunchi Cafe',
    image: 'https://source.unsplash.com/random/800x600/?restaurant',
    cuisines: ['French', 'Italian'],
    hours: 'Open until 11PM Fri',
    phone: '(415) 552-2622',
    website: 'zunchicafe.com',
    eatableReview: {
      rating: 5,
      reviewCount: 42,
      quote: 'Food was 10/10 and the chef took great care of our son who is allergic to peanuts and tree nuts'
    },
    googleReview: {
      rating: 4,
      reviewCount: 87,
      quote: 'Excellent food and atmosphere. Highly recommend for a nice evening out.'
    },
    allergens: [
      { name: 'Peanuts', icon: '🥜' },
      { name: 'Tree nuts', icon: '🌰' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: true
    }
  },
  {
    id: 2,
    name: 'Sideshow Kitchen',
    image: 'https://source.unsplash.com/random/800x600/?cafe',
    cuisines: ['American', 'Burgers'],
    hours: 'Open until 10PM',
    phone: '(415) 555-1234',
    website: 'sideshowkitchen.com',
    eatableReview: {
      rating: 4,
      reviewCount: 34,
      quote: 'Great gluten-free options and very knowledgeable about cross-contamination'
    },
    googleReview: {
      rating: 4,
      reviewCount: 65,
      quote: 'Delicious burgers and friendly staff. A bit pricey but worth it.'
    },
    allergens: [
      { name: 'Gluten', icon: '🌾' },
      { name: 'Dairy', icon: '🥛' }
    ],
    accommodations: {
      chefAvailable: true,
      allergenMenu: false
    }
  }
];

export default function SearchPage() {
  const location = useLocation();
  const initialState = location.state || {};

  const [selectedLocation, setSelectedLocation] = useState(initialState.location || null);
  const [selectedAllergens, setSelectedAllergens] = useState(initialState.allergens || []);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurantDetail, setSelectedRestaurantDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Highest Rated');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    // Set restaurant data
    setRestaurants(sampleRestaurants);
    
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
  }, []);

  return (
    <div className="min-h-screen" style={{ paddingBottom: '80px' }}>
      {/* Exact header from homepage with inline styles */}
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
              onClick={() => setShowLoginModal(true)}
              style={{ 
                marginRight: '15px', 
                background: 'none',
                border: 'none',
                color: 'black',
                fontSize: 'clamp(12px, 3vw, 14px)',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => {
                console.log('Register button clicked');
                setShowRegisterModal(true);
              }}
              style={{ 
                backgroundColor: '#1e40af',
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '4px', 
                border: 'none',
                fontSize: 'clamp(12px, 3vw, 14px)',
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main style={{ padding: '16px' }}>
        {/* Location Header - Using strong inline styles to force correct layout */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
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
            }}>Restaurants near Current Location</h2>
          </div>
          
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" x2="9" y1="3" y2="18" />
              <line x1="15" x2="15" y1="6" y2="21" />
            </svg>
            Show Map
          </button>
        </div>

        {/* Search and Filter Controls - Adjusted column widths */}
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

        {/* Restaurant List */}
        <RestaurantList 
          restaurants={restaurants} 
          isLoading={isLoading}
          onSelectRestaurant={setSelectedRestaurantDetail}
        />
      </main>

      {/* Use the reusable Footer component */}
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