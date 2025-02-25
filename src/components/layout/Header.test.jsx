import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../../test-utils/test-wrapper';
import { Header } from './Header';

describe('Header', () => {
  it('renders logo and brand name', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    const logoLink = screen.getByRole('link', { name: /eat.*ABLE.*ℹ️/i });
    expect(logoLink).toBeInTheDocument();
  });

  it('renders authentication links', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
  });
}); 