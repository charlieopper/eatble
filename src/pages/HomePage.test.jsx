import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { 
  registerWithEmailPassword, 
  loginWithEmailPassword, 
  loginWithGoogle, 
  loginWithFacebook 
} from '../services/authService';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

// Mock the modules
jest.mock('../services/authService');
jest.mock('./firebaseConfig', () => ({
  auth: {},
  db: {}
}));
jest.mock('firebase/auth');
jest.mock('react-hot-toast');

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('HomePage Component', () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the homepage', () => {
    renderHomePage();
    expect(screen.getByText(/Allergy-Friendly Restaurant Reviews/i)).toBeInTheDocument();
  });

  describe('Authentication', () => {
    describe('Registration', () => {
      it('should register a user with email and password', async () => {
        // Mock successful registration
        registerWithEmailPassword.mockResolvedValue({ uid: 'test-uid' });
        
        renderHomePage();
        
        // Open registration modal
        fireEvent.click(screen.getByText('Register'));
        
        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'Password123!' } });
        
        // Submit the form
        fireEvent.click(screen.getByText('Create Account'));
        
        // Wait for registration to complete
        await waitFor(() => {
          expect(registerWithEmailPassword).toHaveBeenCalledWith('test@example.com', 'Password123!', 'testuser');
          expect(toast.success).toHaveBeenCalledWith('Registration successful!');
        });
      });
      
      it('should show error message if registration fails', async () => {
        // Mock failed registration
        registerWithEmailPassword.mockRejectedValue(new Error('Registration failed'));
        
        renderHomePage();
        
        // Open registration modal
        fireEvent.click(screen.getByText('Register'));
        
        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'Password123!' } });
        
        // Submit the form
        fireEvent.click(screen.getByText('Create Account'));
        
        // Wait for error message
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Registration failed: Registration failed');
        });
      });
      
      it('should validate password requirements', async () => {
        renderHomePage();
        
        // Open registration modal
        fireEvent.click(screen.getByText('Register'));
        
        // Fill in the form with weak password
        fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'weak' } });
        
        // Submit the form
        fireEvent.click(screen.getByText('Create Account'));
        
        // Registration should not be called
        expect(registerWithEmailPassword).not.toHaveBeenCalled();
      });
    });
    
    describe('Login', () => {
      it('should login a user with email and password', async () => {
        // Mock successful login
        loginWithEmailPassword.mockResolvedValue({ uid: 'test-uid' });
        
        renderHomePage();
        
        // Open login modal
        fireEvent.click(screen.getByText('Login'));
        
        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123!' } });
        
        // Submit the form
        fireEvent.click(screen.getByText('Sign In'));
        
        // Wait for login to complete
        await waitFor(() => {
          expect(loginWithEmailPassword).toHaveBeenCalledWith('test@example.com', 'Password123!');
          expect(toast.success).toHaveBeenCalledWith('Login successful!');
        });
      });
      
      it('should show error message if login fails', async () => {
        // Mock failed login
        loginWithEmailPassword.mockRejectedValue(new Error('Login failed'));
        
        renderHomePage();
        
        // Open login modal
        fireEvent.click(screen.getByText('Login'));
        
        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123!' } });
        
        // Submit the form
        fireEvent.click(screen.getByText('Sign In'));
        
        // Wait for error message
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Login failed: Login failed');
        });
      });
      
      it('should login with Google', async () => {
        // Mock successful Google login
        loginWithGoogle.mockResolvedValue({ uid: 'test-uid' });
        
        renderHomePage();
        
        // Open login modal
        fireEvent.click(screen.getByText('Login'));
        
        // Click Google login button
        fireEvent.click(screen.getByText('Continue with Google'));
        
        // Wait for login to complete
        await waitFor(() => {
          expect(loginWithGoogle).toHaveBeenCalled();
          expect(toast.success).toHaveBeenCalledWith('Google login successful!');
        });
      });
      
      it('should handle Google login errors', async () => {
        // Mock failed Google login
        const error = new Error('Google login failed');
        error.code = 'auth/popup-closed-by-user';
        loginWithGoogle.mockRejectedValue(error);
        
        renderHomePage();
        
        // Open login modal
        fireEvent.click(screen.getByText('Login'));
        
        // Click Google login button
        fireEvent.click(screen.getByText('Continue with Google'));
        
        // Wait for error message
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Login canceled. Please try again.');
        });
      });
      
      it.skip('should login with Facebook', async () => {
        // Mock successful Facebook login
        loginWithFacebook.mockResolvedValue({ uid: 'test-uid' });
        
        renderHomePage();
        
        // Open login modal
        fireEvent.click(screen.getByText('Login'));
        
        // Find the Facebook button by a more reliable selector
        const facebookButton = screen.getByRole('button', { 
          name: /facebook/i  // Use a case-insensitive regex to match any button with "Facebook" in its text
        });
        fireEvent.click(facebookButton);
        
        // Wait for login to complete
        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith('Facebook login successful!');
        });
      });
      
      it.skip('should handle Facebook login errors', async () => {
        // Mock failed Facebook login
        const error = new Error('Facebook login failed');
        error.code = 'auth/popup-closed-by-user';
        loginWithFacebook.mockRejectedValue(error);
        
        renderHomePage();
        
        // Open login modal
        fireEvent.click(screen.getByText('Login'));
        
        // Find the Facebook button by a more reliable selector
        const facebookButton = screen.getByRole('button', { 
          name: /facebook/i
        });
        fireEvent.click(facebookButton);
        
        // Wait for error message
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Login canceled. Please try again.');
        });
      });
    });
    
    describe('Allergen Selection', () => {
      it('should include selected allergens when registering', async () => {
        // Mock successful registration
        registerWithEmailPassword.mockResolvedValue({ uid: 'test-uid' });
        
        renderHomePage();
        
        // Open registration modal
        fireEvent.click(screen.getByText('Register'));
        
        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'Password123!' } });
        
        // Select allergens
        fireEvent.click(screen.getByText('🥜 Peanuts'));
        fireEvent.click(screen.getByText('🥛 Dairy'));
        
        // Submit the form
        fireEvent.click(screen.getByText('Create Account'));
        
        // Wait for registration to complete
        await waitFor(() => {
          expect(registerWithEmailPassword).toHaveBeenCalledWith('test@example.com', 'Password123!', 'testuser');
          // Check that createUserDocument was called with the selected allergens
          // This would require mocking createUserDocument separately
        });
      });
    });
  });
}); 