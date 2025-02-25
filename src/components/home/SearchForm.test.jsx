import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SearchForm } from './SearchForm';

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('SearchForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders all form elements', () => {
    render(
      <MemoryRouter>
        <SearchForm />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText('Enter location')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Restaurant name (optional)')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('SEARCH RESTAURANTS')).toBeInTheDocument();
  });

  it('updates form values on input change', () => {
    render(
      <MemoryRouter>
        <SearchForm />
      </MemoryRouter>
    );
    
    const locationInput = screen.getByPlaceholderText('Enter location');
    fireEvent.change(locationInput, { target: { value: 'New York' } });
    expect(locationInput.value).toBe('New York');
  });

  it('navigates with search params when search button is clicked', () => {
    render(
      <MemoryRouter>
        <SearchForm />
      </MemoryRouter>
    );
    
    const locationInput = screen.getByPlaceholderText('Enter location');
    fireEvent.change(locationInput, { target: { value: 'New York' } });
    
    fireEvent.click(screen.getByText('SEARCH RESTAURANTS'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/restaurants', {
      state: expect.objectContaining({
        location: 'New York'
      })
    });
  });
}); 