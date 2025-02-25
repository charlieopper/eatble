import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../../test-utils/test-wrapper';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders children content', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('includes header component', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );
    const logoLink = screen.getByRole('link', { name: /eat.*ABLE.*ℹ️/i });
    expect(logoLink).toBeInTheDocument();
  });
}); 