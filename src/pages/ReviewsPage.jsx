import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { AuthButtons } from '../components/auth/AuthButtons';
import { useReviews } from '../context/ReviewsContext';
import ReviewCard from '../components/reviews/ReviewCard';

export default function ReviewsPage() {
  const { reviews, isLoading, error } = useReviews(); // Use the reviews context
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <div className="min-h-screen" style={{ paddingBottom: '80px' }}>
      {/* Header - Same as FavoritesPage */}
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
        {/* Location Header - Modified for Reviews */}
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
            <MessageSquare size={20} style={{ marginRight: '8px', color: '#6b7280' }} />
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: 0,
              padding: 0
            }}>
              Your Reviews
              {!isLoading && !error && (
                <span style={{ 
                  marginLeft: '8px',
                  color: '#6b7280',
                  fontSize: '1rem'
                }}>
                  ({reviews.length})
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Reviews List with loading state */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading reviews...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            Error loading reviews: {error}
          </div>
        ) : reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              You haven't written any reviews yet.
            </p>
            <Link 
              to="/restaurants" 
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#2563eb', // Changed from '#0d9488' to our brand blue
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Leave a Review Now
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer activePage="Reviews" />
    </div>
  );
} 