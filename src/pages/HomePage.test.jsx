import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  });

  it('renders hero section', () => {
    expect(screen.getByText(/Find Safe & Delicious Dining/i)).toBeInTheDocument();
  });

  it('renders search form', () => {
    expect(screen.getByPlaceholderText('Enter location')).toBeInTheDocument();
    expect(screen.getByText('SEARCH RESTAURANTS')).toBeInTheDocument();
  });

  it('renders bottom navigation', () => {
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
}); 