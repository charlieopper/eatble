import React from 'react';

const AuthError = ({ error }) => {
  if (!error) return null;

  // Map error messages to user-friendly messages
  const getUserFriendlyMessage = (error) => {
    // Firebase Auth errors
    if (error.includes('auth/invalid-email')) {
      return 'Please enter a valid email address';
    }
    if (error.includes('auth/missing-email')) {
      return 'Please enter your email address';
    }
    if (error.includes('auth/missing-password')) {
      return 'Please enter your password';
    }
    if (error.includes('auth/wrong-password')) {
      return 'Incorrect email or password';
    }
    if (error.includes('auth/user-not-found')) {
      return 'No account found with this email';
    }
    if (error.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email';
    }
    
    // Registration specific errors
    if (error.includes('Password must be')) {
      return 'Password must be at least 8 characters and include letters, numbers, and special characters';
    }
    if (error.includes('Username must be')) {
      return 'Username must be between 3 and 20 characters';
    }
    if (error.includes('All fields are required')) {
      return 'All fields are required';
    }

    // If we get here, it's an unhandled error
    return error.includes('Firebase') ? 'An error occurred. Please try again.' : error;
  };

  return (
    <div style={{
      color: '#dc2626',
      fontSize: '14px',
      marginTop: '8px',
      marginBottom: '8px'
    }}>
      {getUserFriendlyMessage(error)}
    </div>
  );
};

export default AuthError; 