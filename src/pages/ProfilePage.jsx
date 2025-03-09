import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AllergenSelector } from '../components/allergens/AllergenSelector';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { Bell, ChevronRight, Edit, LogOut, Settings, Star, User } from 'lucide-react';
import { LoginLogoutButton } from '../components/auth/LoginLogoutButton';
import { AuthButtons } from '../components/auth/AuthButtons';

// Mock favorite restaurants
const favoriteRestaurants = [
  {
    id: "zunchi-cafe",
    name: "Zunchi Cafe",
    image: "/placeholder.svg?height=100&width=100",
    cuisines: ["French", "Italian"],
    rating: 4.8,
  },
  {
    id: "namastey-palace",
    name: "Namastey Palace",
    image: "/placeholder.svg?height=100&width=100",
    cuisines: ["Indian", "Vegetarian"],
    rating: 4.5,
  },
];

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    restaurantName: "Zunchi Cafe",
    date: "2024-02-20",
    rating: 5,
    text: "Amazing experience! The chef personally came to discuss our allergies.",
    allergens: ["Peanuts", "Tree nuts"],
  },
  {
    id: "2",
    restaurantName: "Sideshow Kitchen",
    date: "2024-01-15",
    rating: 4,
    text: "Great gluten-free options and very knowledgeable about cross-contamination.",
    allergens: ["Gluten", "Dairy"],
  },
  {
    id: "3",
    restaurantName: "Namastey Palace",
    date: "2023-12-05",
    rating: 5,
    text: "They have a separate menu for allergen-free dishes and the staff is very accommodating.",
    allergens: ["Dairy", "Nuts"],
  },
];

// Constants from RestaurantCard
const TEAL_COLOR = "#0d9488";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUserData } = useAuth();
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [displayedAllergens, setDisplayedAllergens] = useState([]);

  // Debug log when component mounts and when user/selectedAllergens change
  useEffect(() => {
    console.log('ProfilePage - Current user:', user);
    console.log('ProfilePage - Selected allergens:', selectedAllergens);
  }, [user, selectedAllergens]);

  // Default avatar - using a more reliable default avatar service
  const defaultAvatar = "https://ui-avatars.com/api/?name=" + 
    encodeURIComponent(user?.displayName || "User") + "&background=random";

  useEffect(() => {
    console.log('Auth state in ProfilePage:', {
      user: user || 'no user',
      authLoading,
      userEmail: user?.email,
      userUID: user?.uid
    });
  }, [user, authLoading]);

  // Fetch latest user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.uid) {
        console.log('No valid user object found, skipping data fetch');
        setDataLoading(false);
        return;
      }

      try {
        console.log('Attempting to fetch user data for:', user.uid);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('User document found:', data);
          setUserData(data);
        } else {
          console.log('No user document found, creating default data structure');
          const defaultUserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            joinDate: new Date().toISOString(),
            reviewCount: 0,
            connectionCount: 0,
            favoriteRestaurants: [],
            allergens: [],
            location: ''
          };
          setUserData(defaultUserData);
          
          // Create the user document
          try {
            await setDoc(docRef, defaultUserData);
            console.log('Created new user document');
          } catch (err) {
            console.error('Failed to create user document:', err);
          }
        }
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('Failed to load profile data: ' + err.message);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  // Initialize selectedAllergens from user.allergens or empty array
  useEffect(() => {
    if (user) {
      setSelectedAllergens(user.allergens || []);
      setDisplayedAllergens(user.allergens || []);
    }
  }, [user]);

  const handleSaveAllergens = async () => {
    console.log('Starting save process...');
    setIsUpdating(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          allergens: selectedAllergens || []
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          allergens: selectedAllergens || []
        });
      }
      
      setDisplayedAllergens(selectedAllergens);
      setShowAllergenModal(false);
      toast.success('Allergens updated successfully');
      
      // Force reload the page to refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating allergens:', error);
      toast.error(`Failed to update allergens: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAllergen = (allergenName) => {
    console.log('Toggling allergen:', allergenName);
    setSelectedAllergens(prev => {
      const newAllergens = prev.includes(allergenName)
        ? prev.filter(a => a !== allergenName)
        : [...prev, allergenName];
      console.log('New selected allergens:', newAllergens);
      return newAllergens;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const allergenTagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#ccfbf1',
    border: '1px solid #99f6e4',
    borderRadius: '9999px',
    fontSize: '12px',
    color: TEAL_COLOR,
    marginRight: '4px'
  };

  function getAllergenEmoji(allergen) {
    const emojis = {
      'Peanuts': '🥜',
      'Tree nuts': '🌰',
      'Shellfish': '🦐'
    };
    return emojis[allergen] || '';
  }

  const handleImageError = (e) => {
    e.target.src = defaultAvatar;
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setShowAllergenModal(false);
        setHasUnsavedChanges(false);
        setSelectedAllergens(user?.allergens || []);
      }
    } else {
      setShowAllergenModal(false);
    }
  };

  const handleAllergenChange = (allergens) => {
    setHasUnsavedChanges(true);
  };

  const mainContent = () => {
    console.log('Rendering mainContent with userData:', userData);
    
    if (authLoading) {
      console.log('Auth is loading, showing loading state');
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing authentication...</p>
          </div>
        </div>
      );
    }

    if (!user || !user.uid) {
      console.log('No user found, showing login prompt');
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-4">
            <p className="text-xl font-semibold mb-2">Please log in to view your profile</p>
            <p className="text-sm text-gray-500">
              Visit the <a href="/auth-test" className="text-blue-600 underline">login page</a> to sign in
            </p>
          </div>
        </div>
      );
    }

    if (dataLoading) {
      console.log('Data is loading, showing loading state');
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      console.log('Error occurred:', error);
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-4">
            <p className="text-red-600">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-blue-600 underline">
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!userData) {
      console.log('No userData available');
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-4">
            <p>Unable to load profile data. Please try again.</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-blue-600 underline">
              Retry
            </button>
          </div>
        </div>
      );
    }

    console.log('Rendering profile with userData:', {
      displayName: userData.displayName,
      email: userData.email,
      allergens: userData.allergens,
      reviewCount: userData.reviewCount,
      favorites: userData.favoriteRestaurants?.length
    });

    console.log("User allergens:", user?.allergens);

    return (
      <>
        <div className="min-h-screen" style={{ paddingBottom: '80px' }}>
          {/* Header - Responsive */}
          <div style={{ 
            padding: '12px 16px',
            borderBottom: '1px solid #eaeaea',
            backgroundColor: 'white'
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
              <AuthButtons 
                setShowLoginModal={setShowLoginModal} 
                setShowRegisterModal={setShowRegisterModal} 
              />
            </div>
          </div>

          <main className="bg-gray-50">
            {console.log('Rendering main content container')}
            <div className="container mx-auto px-4 py-6">
              {console.log('Profile section rendering with container styles')}
              {/* Profile Header */}
              <div className="max-w-[672px] mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex flex-col items-center">
                    {console.log('Profile photo section rendering')}
                    <div style={{
                      width: '150px',
                      height: '150px',
                      margin: '0 auto',
                      marginBottom: '16px',
                      paddingTop: '16px'
                    }}>
                      <img
                        src={user?.photoURL || defaultAvatar}
                        alt="Profile"
                        onError={handleImageError}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    {console.log('Profile info section rendering')}
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0 20px'
                    }}>
                      <h1 style={{
                        textAlign: 'center',
                        margin: '0 0 24px 0',
                        fontSize: '24px',
                        fontWeight: '600',
                        wordBreak: 'break-word',
                        position: 'relative',
                        left: '-19px'
                      }}>
                        {userData?.displayName || 'User'}
                      </h1>
                      {console.log('Allergens section rendering')}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      }}>
                        {userData?.allergens?.map((allergen, index) => (
                          <span key={index} style={allergenTagStyle}>
                            {getAllergenEmoji(allergen)} {allergen}
                          </span>
                        ))}
                        
                        <button 
                          onClick={() => setShowAllergenModal(true)}
                          disabled={isUpdating}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 12px',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.7 : 1
                          }}
                        >
                          <Edit size={12} />
                          {isUpdating ? 'Updating...' : 'Edit Allergens'}
                        </button>
                      </div>
                      {console.log('Stats section rendering')}
                      <div style={{
                        display: 'flex',
                        gap: '24px',
                        marginBottom: '24px'
                      }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{userData?.reviewCount || 0}</span>
                          <span style={{ color: '#666', marginLeft: '4px' }}>Reviews</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{userData?.favoriteRestaurants?.length || 0}</span>
                          <span style={{ color: '#666', marginLeft: '4px' }}>Favorites</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Updated Reviews/Favorites Toggle */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '2px',
                  maxWidth: '300px',
                  margin: '0 auto 24px auto'
                }}>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: activeTab === 'reviews' ? '#1e40af' : 'transparent',
                      color: activeTab === 'reviews' ? 'white' : '#4b5563',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Reviews
                  </button>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: activeTab === 'favorites' ? '#1e40af' : 'transparent',
                      color: activeTab === 'favorites' ? 'white' : '#4b5563',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Favorites
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'reviews' ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    {mockReviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-start mb-2">
                          <a href={`/restaurant/${review.id}`} className="font-semibold hover:text-blue-600">
                            {review.restaurantName}
                          </a>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-3">{review.text}</p>
                        <div className="flex flex-wrap gap-2">
                          {review.allergens.map((allergen) => (
                            <span
                              key={allergen}
                              className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200"
                            >
                              {allergen === "Peanuts" ? "🥜" : allergen === "Tree nuts" ? "🌰" : "🥛"} {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    {favoriteRestaurants.map((restaurant) => (
                      <a href={`/restaurant/${restaurant.id}`} key={restaurant.id}>
                        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <div className="flex gap-2 mb-1">
                              {restaurant.cuisines.map((cuisine) => (
                                <span key={cuisine} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {cuisine}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(restaurant.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-sm">{restaurant.rating}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Settings Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
                  <h2 className="sr-only">Settings</h2>
                  <div className="divide-y">
                    <a href="/profile/settings" className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-3 text-gray-500" />
                        <span>Account Settings</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </a>
                    <a href="/profile/allergens" className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 mr-3 text-gray-500"
                        >
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                        <span>Manage Allergens</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </a>
                    <a href="/profile/notifications" className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-3 text-gray-500" />
                        <span>Notification Preferences</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </a>
                    <a href="/profile/privacy" className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-3 text-gray-500" />
                        <span>Privacy Settings</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </a>
                    <div className="w-full flex items-center p-4 hover:bg-gray-50">
                      <LogOut className="h-5 w-5 mr-3" />
                      <LoginLogoutButton setShowLoginModal={setShowLoginModal} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <Footer activePage="Profile" />

        {/* Allergen Modal */}
        {showAllergenModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>
                Edit Your Allergens
              </h2>
              
              <AllergenSelector
                selectedAllergens={selectedAllergens}
                toggleAllergen={toggleAllergen}
              />

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    console.log('Canceling allergen edit');
                    setShowAllergenModal(false);
                  }}
                  disabled={isUpdating}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Save button clicked');
                    handleSaveAllergens();
                  }}
                  disabled={isUpdating}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ paddingTop: '32px' }}>
      {mainContent()}
    </div>
  );
} 