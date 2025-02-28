import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Star, Heart, User } from 'lucide-react';

const BottomNavigation = ({ activeItem = 'Home' }) => {
  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'Search', icon: <Search size={20} />, path: '/search' },
    { name: 'Reviews', icon: <Star size={20} />, path: '/reviews' },
    { name: 'Favorites', icon: <Heart size={20} />, path: '/favorites' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-t sticky bottom-0 z-10">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center ${
              activeItem === item.name ? "text-green-600" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation; 