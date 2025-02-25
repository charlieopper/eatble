import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from './test-utils/test-wrapper';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    expect(screen.getByRole('heading', { 
      name: 'Allergy-Friendly Restaurant Reviews',
      level: 1 
    })).toBeInTheDocument();
  });
}); 