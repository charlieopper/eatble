import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Star, Heart, User } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/"
          className="flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link 
          to="/restaurants"
          className="flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Link>
        <Link 
          to="/reviews"
          className="flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <Star className="h-5 w-5" />
          <span>Reviews</span>
        </Link>
        <Link 
          to="/favorites"
          className="flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <Heart className="h-5 w-5" />
          <span>Favorites</span>
        </Link>
        <Link 
          to="/profile"
          className="flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
} 