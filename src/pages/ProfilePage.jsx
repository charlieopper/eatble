import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AllergenSelector } from '../components/allergens/AllergenSelector';
import Footer from '../components/layout/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { Bell, ChevronRight, Edit, LogOut, Settings, Star, User } from 'lucide-react';
import { LoginLogoutButton } from '../components/auth/LoginLogoutButton';
import { AuthButtons } from '../components/auth/AuthButtons';
import ReviewCard from '../components/reviews/ReviewCard';
import { getAllergenEmoji } from '../utils/allergenUtils';
import RestaurantCard from '../components/restaurants/RestaurantCard';
import AccountSettingsModal from '../components/settings/AccountSettingsModal';
import NotificationSettingsModal from '../components/settings/NotificationSettingsModal';
import PrivacySettingsModal from '../components/settings/PrivacySettingsModal';
import AllergenModal from '../components/allergens/AllergenModal';
import { useReviews } from '../context/ReviewsContext';

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    restaurantName: "Zunchi Cafe",
    date: "2024-02-20",
    rating: 5,
    text: "Amazing experience! The chef personally came to discuss our allergies.",
    allergens: ["Peanuts", "Tree Nuts"],
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
    allergens: ["Dairy", "Tree Nuts"],
  },
];

// Constants from RestaurantCard
const TEAL_COLOR = "#0d9488";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUserData, logout } = useAuth();
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [displayedAllergens, setDisplayedAllergens] = useState([]);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const navigate = useNavigate();
  const { reviews, isLoading, error: reviewsError } = useReviews();

  const defaultAvatar = "https://ui-avatars.com/api/?name=" + 
    encodeURIComponent(user?.displayName || "User") + "&background=random";

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.uid) {
        setDataLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
        } else {
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
          await setDoc(docRef, defaultUserData);
        }
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      setSelectedAllergens(user.allergens || []);
      setDisplayedAllergens(user.allergens || []);
    }
  }, [user]);

  const handleSaveAllergens = async () => {
    setIsUpdating(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          allergens: selectedAllergens || []
        });
      } else {
        await updateDoc(userRef, {
          allergens: selectedAllergens || []
        });
      }
      
      setDisplayedAllergens(selectedAllergens);
      setShowAllergenModal(false);
      toast.success('Allergens updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error(`Failed to update allergens: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAllergen = (allergenName) => {
    setSelectedAllergens(prev => {
      const newAllergens = prev.includes(allergenName)
        ? prev.filter(a => a !== allergenName)
        : [...prev, allergenName];
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

  const renderAllergen = (allergen) => (
    <span
      key={allergen}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#e0f2f1',
        padding: '4px 12px',
        borderRadius: '16px',
        margin: '4px',
        fontSize: '14px'
      }}
    >
      <span style={{ marginRight: '8px', fontSize: '16px' }}>
        {getAllergenEmoji(allergen)}
      </span>
      {allergen}
    </span>
  );

  // Calculate counts from actual data
  const reviewCount = mockReviews.length;
  const favoriteCount = userData?.favoriteRestaurants?.length || 0;

  const handleAllergenClick = () => {
    setShowAllergenModal(true);
  };

  const handleAccountSettingsClick = () => {
    setShowAccountModal(true);
  };

  const mainContent = () => {
    if (authLoading) {
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

    return (
      <>
        <div>
          {/* Header */}
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
            <div className="container mx-auto px-4 py-6">
              {/* Profile Header */}
              <div className="max-w-[672px] mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex flex-col items-center">
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
                          onClick={handleAllergenClick}
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
                      <div style={{
                        display: 'flex',
                        gap: '24px',
                        marginBottom: '24px'
                      }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{reviews.length}</span>
                          <span style={{ color: '#666', marginLeft: '4px' }}>Reviews</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{favoriteCount}</span>
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
                  <div className="flex flex-col gap-4">
                    {isLoading ? (
                      <div>Loading reviews...</div>
                    ) : reviewsError ? (
                      <div>Error loading reviews: {reviewsError}</div>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))
                    ) : (
                      <p style={{ 
                        textAlign: 'center', 
                        color: '#666',
                        marginTop: '20px' 
                      }}>
                        No reviews yet
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="favorites-container" style={{ padding: '16px' }}>
                    {userData?.favoriteRestaurants?.map((restaurant) => {
                      return (
                        <RestaurantCard 
                          key={restaurant.id}
                          restaurant={restaurant}
                        />
                      );
                    })}
                    
                    {(!userData?.favoriteRestaurants || userData.favoriteRestaurants.length === 0) && (
                      <p style={{ 
                        textAlign: 'center', 
                        color: '#666',
                        marginTop: '20px' 
                      }}>
                        No favorite restaurants yet
                      </p>
                    )}
                  </div>
                )}

                {/* Account Card */}
                <div style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  marginTop: '20px'
                }}>
                  {/* Account Title */}
                  <div style={{ 
                    padding: '16px',
                    borderBottom: '1px solid #f8f8f8'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: '0'
                    }}>
                      Account
                    </h3>
                  </div>

                  {/* Settings Options */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button 
                      onClick={handleAccountSettingsClick}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderBottom: '1px solid #f8f8f8',
                        textDecoration: 'none',
                        color: 'inherit',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        ':hover': {
                          backgroundColor: '#f9fafb'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Settings size={20} style={{ marginRight: '12px', color: '#6b7280' }} />
                        <span>Account Settings</span>
                      </div>
                      <ChevronRight size={20} style={{ color: '#9ca3af' }} />
                    </button>

                    <button 
                      onClick={logout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        ':hover': {
                          backgroundColor: '#f9fafb'
                        }
                      }}
                    >
                      <LogOut size={20} style={{ marginRight: '12px' }} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <Footer activePage="Profile" />

        {/* Account Modal */}
        {showAccountModal && (
          <AccountSettingsModal 
            isOpen={showAccountModal}
            onClose={() => setShowAccountModal(false)}
          />
        )}

        {/* Notification Modal */}
        {showNotificationModal && (
          <NotificationSettingsModal 
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
          />
        )}

        {/* Privacy Modal */}
        {showPrivacyModal && (
          <PrivacySettingsModal 
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
          />
        )}

        {/* Allergen Modal */}
        {showAllergenModal && (
          <AllergenModal
            isOpen={showAllergenModal}
            onClose={() => setShowAllergenModal(false)}
          />
        )}
      </>
    );
  };

  return (
    <div>
      {mainContent()}
    </div>
  );
} 