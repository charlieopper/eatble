import React from 'react';
import { Header } from './Header';
import { BottomNav } from '../home/BottomNav';

export function Layout({ children }) {
  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main>
        {children}
      </main>
      <BottomNav />
    </div>
  );
} 