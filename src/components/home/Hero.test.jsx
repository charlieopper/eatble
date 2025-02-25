import React from 'react';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the main heading', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { 
      name: /Find Safe & Delicious Dining/i,
      level: 1 
    })).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Hero />);
    expect(screen.getByRole('button', { name: /Find Restaurants/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Share Your Experience/i })).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Hero />);
    expect(screen.getByText(/Discover allergen-friendly restaurants/i)).toBeInTheDocument();
  });
}); 