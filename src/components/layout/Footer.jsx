import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Star, Heart, User } from 'lucide-react';

export default function Footer({ activePage = 'Home' }) {
  useEffect(() => {
    // Add the CSS to the document directly to ensure it takes precedence
    const style = document.createElement('style');
    style.innerHTML = `
      .eatable-footer {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        background-color: white !important;
        border-top: 1px solid #eaeaea !important;
        z-index: 50 !important;
      }
      
      .eatable-footer-inner {
        display: flex !important;
        justify-content: space-around !important;
        align-items: center !important;
        height: 64px !important;
      }
      
      .eatable-footer-link {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 1 !important;
        text-decoration: none !important;
        color: #4b5563 !important;
      }
      
      .eatable-footer-link.active {
        color: #1e40af !important;
      }
      
      .eatable-footer-text {
        font-size: 12px !important;
        margin-top: 4px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <nav className="eatable-footer">
      <div className="eatable-footer-inner">
        <Link to="/" className={`eatable-footer-link ${activePage === 'Home' ? 'active' : ''}`}>
          <Home size={20} />
          <span className="eatable-footer-text">Home</span>
        </Link>
        
        <Link to="/restaurants" className={`eatable-footer-link ${activePage === 'Search' ? 'active' : ''}`}>
          <Search size={20} />
          <span className="eatable-footer-text">Search</span>
        </Link>
        
        <Link to="/reviews" className={`eatable-footer-link ${activePage === 'Reviews' ? 'active' : ''}`}>
          <Star size={20} />
          <span className="eatable-footer-text">Reviews</span>
        </Link>
        
        <Link to="/favorites" className={`eatable-footer-link ${activePage === 'Favorites' ? 'active' : ''}`}>
          <Heart size={20} />
          <span className="eatable-footer-text">Favorites</span>
        </Link>
        
        <Link to="/profile" className={`eatable-footer-link ${activePage === 'Profile' ? 'active' : ''}`}>
          <User size={20} />
          <span className="eatable-footer-text">Profile</span>
        </Link>
      </div>
    </nav>
  );
} 