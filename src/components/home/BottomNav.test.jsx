import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    );
  });

  it('renders all navigation links', () => {
    expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reviews/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /favorites/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });

  it('has correct navigation paths', () => {
    expect(screen.getByRole('link', { name: /search/i })).toHaveAttribute('href', '/search');
    expect(screen.getByRole('link', { name: /reviews/i })).toHaveAttribute('href', '/reviews');
    expect(screen.getByRole('link', { name: /favorites/i })).toHaveAttribute('href', '/favorites');
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile');
  });

  it('renders icons for each navigation item', () => {
    // Since Lucide icons are SVGs, we can check for their presence
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons).toHaveLength(4);
  });
}); 