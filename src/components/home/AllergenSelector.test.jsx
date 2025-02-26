import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AllergenSelector } from './AllergenSelector';

describe('AllergenSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all allergen buttons', () => {
    render(<AllergenSelector selectedAllergens={[]} onAllergenChange={mockOnChange} />);
    expect(screen.getByText('Peanuts')).toBeInTheDocument();
    expect(screen.getByText('Tree Nuts')).toBeInTheDocument();
    // ... test for other allergens
  });

  it('shows selected allergens with different styling', () => {
    render(
      <AllergenSelector 
        selectedAllergens={['peanuts']} 
        onAllergenChange={mockOnChange} 
      />
    );
    const peanutButton = screen.getByRole('button', { name: /Peanuts/i });
    expect(peanutButton).toHaveClass('bg-primary');
  });

  it('calls onAllergenChange when allergen is toggled', () => {
    render(
      <AllergenSelector 
        selectedAllergens={[]} 
        onAllergenChange={mockOnChange} 
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Peanuts/i }));
    expect(mockOnChange).toHaveBeenCalledWith(['peanuts']);
  });
}); 