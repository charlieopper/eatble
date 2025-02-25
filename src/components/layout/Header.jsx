import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white border-b py-2 px-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="font-bold">eat<span className="text-red-500">ABLE</span></span>
          <span className="ml-1">ℹ️</span>
        </Link>
        <div>
          <Link to="/login" className="mr-2">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </header>
  );
} 