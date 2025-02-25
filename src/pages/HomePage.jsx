import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Star, Heart, User, X, Eye, EyeOff, Facebook, Mail } from 'lucide-react';
import { mockAuth } from './mockAuth';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

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

  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Validate form
    if (!loginEmail || !loginPassword) {
      setLoginError('Email and password are required');
      return;
    }
    
    try {
      // Sign in with mock auth
      await mockAuth.signInWithEmailAndPassword(loginEmail, loginPassword);
      
      // Close modal and redirect to profile page
      setShowLoginModal(false);
      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message);
    }
  };

  // Function to handle profile creation
  const handleProfileCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!email || !password || !confirmPassword) {
      setFormError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      // Create user with mock auth
      await mockAuth.createUserWithEmailAndPassword(email, password);
      
      // Store selected allergens in local storage for the new profile
      if (selectedAllergens.length > 0) {
        localStorage.setItem('userAllergens', JSON.stringify(selectedAllergens));
      }
      
      // Close modal and redirect to profile page
      setShowRegisterModal(false);
      navigate('/profile');
    } catch (error) {
      console.error('Registration error:', error);
      setFormError(error.message);
    }
  };

  // Function to handle "Leave a Review" button
  const handleLeaveReview = () => {
    navigate('/reviews/new');
  };

  // Function to handle social login
  const handleSocialLogin = async (provider) => {
    try {
      if (provider === 'Google') {
        await mockAuth.signInWithGoogle();
      } else {
        await mockAuth.signInWithFacebook();
      }
      
      // Close modals and redirect to profile page
      setShowLoginModal(false);
      setShowRegisterModal(false);
      navigate('/profile');
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setLoginError(error.message);
    }
  };

  return (
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
              onClick={() => setShowRegisterModal(true)}
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
          <div>
            <h3 style={{ 
              fontWeight: '500', 
              marginBottom: '16px',
              fontSize: '18px'
            }}>
              Select Allergens:
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {[
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
              ].map((allergen, index) => {
                const isSelected = selectedAllergens.includes(allergen.name);
                return (
                  <button 
                    key={index} 
                    onClick={() => toggleAllergen(allergen.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '8px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#ef4444' : 'white',
                      color: isSelected ? 'white' : 'black',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s, color 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{allergen.emoji}</span> {allergen.name}
                  </button>
                );
              })}
            </div>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              paddingTop: '8px'
            }}>
              <button 
                onClick={() => setShowProfileModal(true)}
                style={{
                  background: 'white',
                  border: '1px solid #2563eb',
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f7ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Create Profile to Save Allergen Settings
              </button>
            </div>
            
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
                style={{
                  width: '100%',
                  backgroundColor: '#166534', // Green color for login
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                Sign In
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
                  onClick={() => handleSocialLogin('Facebook')}
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
                  <Facebook size={20} color="#1877F2" />
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
              <X size={24} />
            </button>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Create an Account
            </h2>
            
            <p style={{
              marginBottom: '24px',
              textAlign: 'center',
              color: '#4b5563'
            }}>
              Join eatABLE to find safe restaurants and share your experiences
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
                    type={showPassword ? "text" : "password"} 
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
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <button 
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#1e40af',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                Create Account
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
                <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '14px' }}>or register with</span>
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
                  onClick={() => handleSocialLogin('Facebook')}
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
                  <Facebook size={20} color="#1877F2" />
                  Facebook
                </button>
              </div>
              
              <div style={{
                textAlign: 'center'
              }}>
                <p style={{ color: '#4b5563', fontSize: '14px' }}>
                  Already have an account? <button 
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
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
                    Login
                  </button>
                </p>
              </div>
            </form>
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
            maxWidth: '500px',
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
                <input 
                  type="password" 
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <button 
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#1e40af',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Create Profile
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
    </div>
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