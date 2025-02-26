import React from 'react';

export const Header = () => (
  <header>
    <div className="logo">eatABLE 🍴</div>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/login">Login</a>
      <a href="/register">Register</a>
    </nav>
  </header>
);

export const ErrorBoundary = ({ children }) => <>{children}</>; 