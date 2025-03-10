import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AllergenSelector } from './AllergenSelector';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function AllergenModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

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
      
      toast.success('Allergens updated successfully');
      onClose();
      
      // Force reload the page to refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating allergens:', error);
      toast.error(`Failed to update allergens: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>Manage Allergens</h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <AllergenSelector 
          selectedAllergens={selectedAllergens}
          toggleAllergen={(allergen) => {
            setSelectedAllergens(prev => 
              prev.includes(allergen) 
                ? prev.filter(a => a !== allergen)
                : [...prev, allergen]
            );
          }}
        />

        <button
          onClick={handleSaveAllergens}
          disabled={isUpdating}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1d4ed8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
} 