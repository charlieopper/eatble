import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold">
            <span className="text-[#663399]">eat</span>
            <span className="text-[#FF6B6B]">ABLE</span>
          </span>
          <span className="text-gray-400 ml-2">🍴</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-[#663399] text-white rounded-lg hover:bg-[#562b85] transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 