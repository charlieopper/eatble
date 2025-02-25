import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export function TestWrapper({ children }) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
} 