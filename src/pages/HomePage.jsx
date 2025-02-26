import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Star, Heart, User, X, Eye, EyeOff, Facebook, Mail } from 'lucide-react';
import { 
  registerWithEmailPassword, 
  loginWithEmailPassword,
  loginWithGoogle,
  loginWithFacebook,
  createUserDocument
} from '../services/authService';
import { auth, db } from './firebaseConfig';
import { facebookProvider } from './firebaseImport';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Add this utility function at the top of your component
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
};

// Add this utility function for better error handling
const logError = (context, error) => {
  console.group(`Error in ${context}`);
  console.error('Error object:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // Log additional Firebase auth error details if available
  if (error.customData) {
    console.error('Custom data:', error.customData);
  }
  
  if (error.email) {
    console.error('Email involved:', error.email);
  }
  
  if (error.credential) {
    console.error('Credential type:', error.credential.constructor.name);
  }
  
  console.groupEnd();
  
  // Return a user-friendly message
  return error.message || 'An unknown error occurred';
};

// First, let's create a reusable AllergenSelector component
const AllergenSelector = ({ selectedAllergens, toggleAllergen }) => {
  // List of all allergens with their emoji icons
  const allergens = [
    { name: 'Peanuts', emoji: '🥜' },
    { name: 'Tree Nuts', emoji: '🌰' },
    { name: 'Dairy', emoji: '🥛' },
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Wheat', emoji: '🌾' },
    { name: 'Gluten', emoji: '🍞' },
    { name: 'Fish', emoji: '🐟' },
    { name: 'Shellfish', emoji: '🦐' },
    { name: 'Soy', emoji: '🫘' },
    { name: 'Sesame', emoji: '🌱' }
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '12px',
        fontWeight: '500'
      }}>
        Select Allergens:
      </label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px'
      }}>
        {allergens.map((allergen) => (
          <button
            key={allergen.name}
            type="button"
            onClick={() => toggleAllergen(allergen.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              border: `1px solid ${selectedAllergens.includes(allergen.name) ? '#3b82f6' : '#d1d5db'}`,
              borderRadius: '6px',
              backgroundColor: selectedAllergens.includes(allergen.name) ? '#eff6ff' : 'white',
              color: '#4b5563',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <span style={{ marginRight: '8px', fontSize: '18px' }}>{allergen.emoji}</span>
            {allergen.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedDistance, setSelectedDistance] = useState('Select Distance');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [location, setLocation] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Profile creation state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Add a style tag to ensure select options are properly sized on mobile
    const style = document.createElement('style');
    style.textContent = `
      select, option {
        font-size: 16px !important;
      }
      select:focus {
        font-size: 16px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Replace the select element with a custom dropdown
  const distanceOptions = ['5 miles', '10 miles', '25 miles', '50 miles'];

  // Function to toggle allergen selection
  const toggleAllergen = (allergenName) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergenName)) {
        return prev.filter(a => a !== allergenName);
      } else {
        return [...prev, allergenName];
      }
    });
  };

  // Function to handle search
  const handleSearch = () => {
    // Validate search criteria
    if (!location) {
      alert('Please enter a location to search');
      return;
    }
    
    // Create search params
    const searchParams = new URLSearchParams();
    if (location) searchParams.append('location', location);
    if (restaurantName) searchParams.append('name', restaurantName);
    if (selectedDistance !== 'Select Distance') searchParams.append('distance', selectedDistance);
    if (selectedAllergens.length > 0) searchParams.append('allergens', selectedAllergens.join(','));
    
    // Navigate to search results page with params
    navigate(`/restaurants?${searchParams.toString()}`);
  };

  // Function to handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    try {
      // Validate form
      if (!email || !password || !username) {
        throw new Error('All fields are required');
      }
      
      if (username.length < 3 || username.length > 20) {
        throw new Error('Username must be between 3 and 20 characters');
      }
      
      // Register user
      const user = await registerWithEmailPassword(email, password, username);
      
      // Create user document with allergens
      await createUserDocument(user, { 
        username, 
        allergens: selectedAllergens 
      });
      
      // Show success message
      toast.success('Registration successful!');
      
      // Close modal
      setShowRegisterModal(false);
      
      // Clear form
      setEmail('');
      setPassword('');
      setUsername('');
      setSelectedAllergens([]);
      
    } catch (error) {
      console.error('Registration error:', error);
      setFormError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Validate form
      if (!loginEmail || !loginPassword) {
        throw new Error('Email and password are required');
      }
      
      // Login user
      await loginWithEmailPassword(loginEmail, loginPassword);
      
      // Show success message
      toast.success('Login successful!');
      
      // Close modal
      setShowLoginModal(false);
      
      // Clear form
      setLoginEmail('');
      setLoginPassword('');
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update social login function
  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      console.log(`Starting ${provider} login`);
      
      if (provider === 'Google') {
        try {
          const user = await loginWithGoogle();
          console.log('Google login successful:', user);
          toast.success('Google login successful!');
          
          // Close modals
          setShowLoginModal(false);
          setShowRegisterModal(false);
          setShowProfileModal(false);
        } catch (googleError) {
          console.error('Google auth error:', googleError);
          
          // Check if it's the "operation not allowed" error
          if (googleError.message.includes('not enabled') || 
              googleError.message.includes('operation-not-allowed')) {
            toast.error('Google authentication is not enabled. Please use email registration or contact the administrator.');
          } else if (googleError.message.includes('Missing or insufficient permissions')) {
            // This is a Firestore permissions error, but authentication succeeded
            toast.success('Google login successful, but profile creation failed. Some features may be limited.');
            
            // Close modals anyway since auth succeeded
            setShowLoginModal(false);
            setShowRegisterModal(false);
            setShowProfileModal(false);
          } else {
            toast.error(googleError.message);
          }
        }
      } else if (provider === 'Facebook') {
        try {
          const user = await loginWithFacebook();
          console.log('Facebook login successful:', user);
          toast.success('Facebook login successful!');
        } catch (fbError) {
          console.error('Facebook auth error:', fbError);
          
          // Show the specific error message from the authService
          toast.error(fbError.message);
          
          setIsLoading(false);
          return;
        }
      }
      
      // Close modals
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowProfileModal(false);
      
    } catch (error) {
      console.error(`${provider} login error:`, error);
      
      // Special handling for Firestore permission errors
      if (error.message.includes('Missing or insufficient permissions')) {
        toast.error('Login successful, but profile creation failed. Some features may be limited.');
        
        // Close modals anyway since auth succeeded
        setShowLoginModal(false);
        setShowRegisterModal(false);
        setShowProfileModal(false);
      } else {
        toast.error(error.message);
        if (showLoginModal) {
          setLoginError(error.message);
        } else {
          setFormError(error.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Replace the handleProfileCreate function with this:
  const handleProfileCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    try {
      // Validate form
      if (!email || !password || !username) {
        throw new Error('All fields are required');
      }
      
      if (username.length < 3 || username.length > 20) {
        throw new Error('Username must be between 3 and 20 characters');
      }
      
      // Register user with selected allergens
      const user = await registerWithEmailPassword(email, password, username);
      await createUserDocument(user, { allergens: selectedAllergens });
      
      // Show success message
      toast.success('Profile created successfully!');
      
      // Close modal
      setShowProfileModal(false);
      
    } catch (error) {
      console.error('Profile creation error:', error);
      setFormError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to your HomePage component
  const handleLeaveReview = () => {
    // Check if user is logged in
    if (!user) {
      // If not logged in, show login modal
      setShowLoginModal(true);
      toast.error('Please log in to leave a review');
      return;
    }
    
    // Navigate to review form
    navigate('/reviews/new');
  };

  // Update the debug function
  const debugFacebookAuth = async () => {
    try {
      setIsLoading(true);
      toast.info('Testing Facebook authentication...');
      
      // Try to sign in with Facebook
      const result = await signInWithPopup(auth, facebookProvider);
      console.log('Facebook auth result:', result);
      
      // Extract user info
      const user = result.user;
      console.log('Facebook user:', user);
      
      // If successful, show success message
      toast.success('Facebook authentication successful!');
      
      // Create user document
      try {
        await createUserDocument(user, { authProvider: 'facebook' });
        toast.success('User document created successfully!');
      } catch (docError) {
        console.error('Error creating user document:', docError);
        toast.error(`Error creating user document: ${docError.message}`);
      }
      
      // Close modals
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowProfileModal(false);
      
    } catch (error) {
      console.error('Facebook auth debug error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error('An account already exists with the same email. Try signing in with a different method.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login canceled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Facebook authentication is not enabled in Firebase. Please contact the administrator.');
      } else {
        toast.error(`Facebook auth error: ${error.code} - ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleFacebookLogin function
  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Facebook login process');
      
      // Use the Facebook provider directly
      const provider = facebookProvider;
      console.log('Facebook provider:', provider);
      
      // Add scopes for additional permissions if needed
      try {
        provider.addScope('email');
        provider.addScope('public_profile');
        console.log('Added scopes to Facebook provider');
      } catch (scopeError) {
        console.error('Error adding scopes:', scopeError);
        // Continue even if adding scopes fails
      }
      
      // Sign in with popup
      console.log('Attempting signInWithPopup');
      const result = await signInWithPopup(auth, provider);
      console.log('Facebook auth result:', result);
      console.log('Facebook user:', result.user);
      
      // Show success message
      toast.success('Facebook login successful!');
      
      // Close modals
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowProfileModal(false);
      
    } catch (error) {
      console.error('Facebook login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle specific errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error('An account already exists with the same email. Try signing in with a different method.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login canceled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Facebook authentication is not enabled in Firebase. Please contact the administrator.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for OAuth operations. Contact the administrator.');
      } else {
        toast.error(`Authentication error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleFacebookButtonClick function
  const handleFacebookButtonClick = () => {
    console.log('Facebook button clicked');
    try {
      handleFacebookLogin();
    } catch (error) {
      console.error('Facebook button click error:', error);
      toast.error('Failed to initiate Facebook login. Please try another method.');
    }
  };

  // Add this function for direct debugging
  const debugDirectFacebookLogin = async () => {
    console.log('Starting direct Facebook login debug');
    try {
      setIsLoading(true);
      
      // Import directly to ensure we have the right provider
      const { FacebookAuthProvider } = await import('firebase/auth');
      const directProvider = new FacebookAuthProvider();
      console.log('Created new Facebook provider:', directProvider);
      
      // Add scopes
      directProvider.addScope('email');
      directProvider.addScope('public_profile');
      
      console.log('Attempting direct Facebook login');
      const result = await signInWithPopup(auth, directProvider);
      console.log('Direct Facebook login successful:', result);
      
      toast.success('Facebook login successful!');
      
      // Close modals
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowProfileModal(false);
      
    } catch (error) {
      console.error('Direct Facebook login error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      toast.error(`Facebook login error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to test toast
  const testToast = () => {
    console.log('Testing toast functions');
    toast.success('This is a success toast');
    
    // Check if other toast methods exist
    console.log('Toast methods:', Object.keys(toast));
    
    // Try to use toast.error
    try {
      toast.error('This is an error toast');
    } catch (e) {
      console.error('Error using toast.error:', e);
    }
  };

  // Add this function to check and fix Firestore permissions
  const checkFirestorePermissions = async () => {
    try {
      console.log('Checking Firestore permissions...');
      
      // Try to write to a test document
      const testDocRef = doc(db, 'test', 'permissions-test');
      await setDoc(testDocRef, { 
        timestamp: serverTimestamp(),
        test: 'This is a test document to check permissions'
      });
      
      console.log('Firestore write successful - permissions are working');
      toast.success('Firestore permissions are working correctly');
      
      // Clean up the test document
      await deleteDoc(testDocRef);
      
    } catch (error) {
      console.error('Firestore permissions error:', error);
      toast.error(`Firestore permissions error: ${error.message}`);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen" style={{ paddingBottom: '80px' }}>
        {/* Header - Responsive */}
        <div style={{ 
          padding: '12px 16px',
          borderBottom: '1px solid #eaeaea'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontWeight: 'bold', fontSize: 'clamp(16px, 4vw, 20px)' }}>
                eat<span style={{ color: '#e53e3e' }}>ABLE</span>
                <span style={{ marginLeft: '4px' }}>🍴</span>
              </span>
            </Link>
            <div>
              <button 
                onClick={() => setShowLoginModal(true)}
                style={{ 
                  marginRight: '15px', 
                  background: 'none',
                  border: 'none',
                  color: 'black',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
              <button 
                onClick={() => {
                  console.log('Register button clicked');
                  setShowRegisterModal(true);
                }}
                style={{ 
                  backgroundColor: '#1e40af',
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  border: 'none',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  cursor: 'pointer'
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section - Responsive */}
        <div style={{ 
          backgroundColor: '#1e40af', 
          color: 'white', 
          padding: 'clamp(32px, 8vw, 48px) 16px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 6vw, 36px)', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            lineHeight: 1.2
          }}>
            Allergy-Friendly Restaurant Reviews
          </h1>
          <p style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            marginBottom: 'clamp(20px, 5vw, 32px)'
          }}>
            Find Safe Places to Eat
          </p>
          <button 
            onClick={handleLeaveReview}
            style={{ 
              backgroundColor: 'white', 
              color: '#1e40af', 
              padding: '12px 24px', 
              borderRadius: '4px', 
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 3.5vw, 16px)'
            }}
          >
            Leave a Review Now
          </button>
        </div>

        {/* Main Content - Responsive */}
        <div style={{
          padding: '16px',
          marginTop: '-24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '16px'
          }}>
            {/* Search Form */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  width: '20px',
                  height: '20px'
                }} />
                <input 
                  type="text" 
                  placeholder="Enter location" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingLeft: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <input 
                type="text" 
                placeholder="Restaurant name (optional)" 
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '16px'
                }}
              />
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{selectedDistance}</span>
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    marginTop: '4px',
                    zIndex: 10,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    {distanceOptions.map((option, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setSelectedDistance(option);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          padding: '12px',
                          borderBottom: index < distanceOptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                          fontSize: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Allergens */}
            <AllergenSelector selectedAllergens={selectedAllergens} toggleAllergen={toggleAllergen} />
            
            <button 
              onClick={handleSearch}
              style={{
                width: '100%',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '12px',
                borderRadius: '6px',
                fontWeight: '500',
                border: 'none',
                marginBottom: '16px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              SEARCH RESTAURANTS
            </button>
          </div>
        </div>
        
        {/* Login Modal */}
        {showLoginModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowLoginModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Welcome back!
              </h2>
              
              <p style={{
                marginBottom: '24px',
                textAlign: 'center',
                color: '#4b5563'
              }}>
                Sign in to your account to continue
              </p>
              
              {loginError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {loginError}
                </div>
              )}
              
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      @
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
                  <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '14px' }}>or continue with</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button 
                    type="button"
                    onClick={handleFacebookButtonClick}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      color: '#4b5563',
                      fontSize: '14px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    <svg width="20" height="20" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
                
                <div style={{
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#4b5563', fontSize: '14px' }}>
                    Don't have an account? <button 
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                      }} 
                      style={{ 
                        color: '#2563eb', 
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Register
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Register Modal */}
        {showRegisterModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '20px 0'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowRegisterModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Create an Account
              </h2>
              
              <p style={{
                color: '#4b5563',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                Join eatABLE to find safe restaurants and share your experiences
              </p>
              
              {formError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Username
                  </label>
                  <input 
                    type="text" 
                    placeholder="Choose a username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Username must be 3-20 characters
                  </p>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Create a password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </button>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Password must be at least 8 characters and include letters, numbers, and special characters
                  </p>
                </div>
                
                <AllergenSelector 
                  selectedAllergens={selectedAllergens} 
                  toggleAllergen={toggleAllergen} 
                />
                
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    marginTop: '8px'
                  }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                
                <div style={{
                  marginTop: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#4b5563', fontSize: '14px' }}>
                    Already have an account? <button 
                      type="button" 
                      onClick={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                      }}
                      style={{ 
                        color: '#2563eb', 
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
                <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '14px' }}>or register with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#4b5563',
                    fontSize: '14px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                
                <button
                  type="button"
                  onClick={debugDirectFacebookLogin}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#4b5563',
                    fontSize: '14px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <svg width="20" height="20" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Creation Modal */}
        {showProfileModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Create Profile
              </h2>
              
              <p style={{
                marginBottom: '24px',
                textAlign: 'center',
                color: '#4b5563'
              }}>
                Create a profile to save your allergen preferences and access your reviews.
              </p>
              
              {formError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleProfileCreate}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Username
                  </label>
                  <input 
                    type="text" 
                    placeholder="Choose a username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Username must be 3-20 characters
                  </p>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Create a password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </button>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Password must be at least 8 characters and include letters, numbers, and special characters
                  </p>
                </div>
                
                <AllergenSelector 
                  selectedAllergens={selectedAllergens} 
                  toggleAllergen={toggleAllergen} 
                />
                
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Creating Profile...' : 'Create Profile'}
                </button>
                
                <div style={{
                  marginTop: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#4b5563', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Login</Link>
                  </p>
                </div>
              </form>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
                <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '14px' }}>or register with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#4b5563',
                    fontSize: '14px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                
                <button
                  type="button"
                  onClick={debugDirectFacebookLogin}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#4b5563',
                    fontSize: '14px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <svg width="20" height="20" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook (Debug)
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Navigation - Mobile Optimized */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #eaeaea',
          zIndex: 50
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '64px'
          }}>
            {[
              { icon: <Home size={20} />, label: 'Home', path: '/' },
              { icon: <Search size={20} />, label: 'Search', path: '/restaurants' },
              { icon: <Star size={20} />, label: 'Reviews', path: '/reviews' },
              { icon: <Heart size={20} />, label: 'Favorites', path: '/favorites' },
              { icon: <User size={20} />, label: 'Profile', path: '/profile' }
            ].map((item, index) => (
              <Link 
                key={index}
                to={item.path} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  color: '#4b5563',
                  textDecoration: 'none'
                }}
              >
                {item.icon}
                <span style={{ fontSize: '12px', marginTop: '4px' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Add a small test button somewhere in your UI */}
        <button 
          onClick={testToast} 
          style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px',
            padding: '5px',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          Test Toast
        </button>

        {/* Add a button to test permissions (for development) */}
        <button 
          onClick={checkFirestorePermissions} 
          style={{ 
            position: 'fixed', 
            bottom: '40px', 
            right: '10px',
            padding: '5px',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          Test Firestore
        </button>
      </div>
    </>
  );
}

// Helper function to get emoji for allergen
function getAllergenEmoji(allergen) {
  const emojis = {
    'Peanuts': '🥜',
    'Tree Nuts': '🌰',
    'Dairy': '🥛',
    'Eggs': '🥚',
    'Wheat': '🌾',
    'Gluten': '🍞',
    'Fish': '🐟',
    'Shellfish': '🦐',
    'Soy': '🫘',
    'Sesame': '🌱'
  };
  return emojis[allergen] || '';
} 