import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function ReviewsPage() {
  // In a real app, this would come from a ReviewsContext or API call
  const [reviews, setReviews] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

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
            >
              Register
            </button>
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
            }}>Your Reviews</h2>
          </div>
        </div>

        {/* Reviews List or Empty State */}
        {reviews.length > 0 ? (
          <div>
            {/* This would be a list of reviews in a real implementation */}
            <p>Your reviews would be listed here</p>
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
                backgroundColor: '#0d9488', // Teal color to match the homepage button
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