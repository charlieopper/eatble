import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../ui/DarkModeToggle';

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          eatABLE
        </Link>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <Link 
            to="/login" 
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 