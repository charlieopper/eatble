import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import RestaurantList from '../components/restaurants/RestaurantList';
import RestaurantDetailModal from '../components/restaurants/RestaurantDetailModal';
import Footer from '../components/layout/Footer';
import { AuthButtons } from '../components/auth/AuthButtons';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [selectedRestaurantDetail, setSelectedRestaurantDetail] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <div className="min-h-screen" style={{ paddingBottom: '80px' }}>
      {/* Header - Same as SearchPage */}
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
          <div className="flex items-center gap-4">
            <AuthButtons 
              setShowLoginModal={setShowLoginModal} 
              setShowRegisterModal={setShowRegisterModal} 
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main style={{ padding: '16px' }}>
        {/* Location Header */}
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
            }}>Your Favorite Restaurants</h2>
          </div>
        </div>

        {/* Favorites List */}
        {favorites.length > 0 ? (
          <RestaurantList 
            restaurants={favorites} 
            isLoading={isLoading} 
            onSelectRestaurant={setSelectedRestaurantDetail}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              You haven't added any favorites yet.
            </p>
            <Link 
              to="/restaurants" 
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Find Restaurants
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer activePage="Favorites" />

      {/* Restaurant Detail Modal */}
      {selectedRestaurantDetail && (
        <RestaurantDetailModal
          restaurant={selectedRestaurantDetail}
          onClose={() => setSelectedRestaurantDetail(null)}
        />
      )}

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}
      
      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
} 