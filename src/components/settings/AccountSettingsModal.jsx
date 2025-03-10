import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc 
} from 'firebase/firestore';
import { 
  updateEmail, 
  updatePassword, 
  deleteUser, 
  EmailAuthProvider,
  reauthenticateWithCredential 
} from 'firebase/auth';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    currentPassword: '',
    newPassword: '',
    showPasswordChange: false
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validatePhone = (phone) => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Reauthenticate user before sensitive operations
  const reauthenticate = async (currentPassword) => {
    try {
      console.log('Attempting to reauthenticate user');
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      console.log('Reauthentication successful');
      return true;
    } catch (error) {
      console.error('Reauthentication failed:', error);
      toast.error('Current password is incorrect');
      return false;
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting to save changes:', { ...formData, currentPassword: '[HIDDEN]' });

    try {
      // Log current user document state
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      console.log('Current user document before update:', userSnap.data());

      // Validate inputs
      if (!validateEmail(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (formData.phone && !validatePhone(formData.phone)) {
        toast.error('Please enter a valid phone number');
        return;
      }

      // Reauthenticate if password provided
      if (formData.currentPassword) {
        const isReauthenticated = await reauthenticate(formData.currentPassword);
        if (!isReauthenticated) return;
      }

      // Update user profile in Firestore
      await updateDoc(userRef, {
        username: formData.username,
        phone: formData.phone
      });

      // Log updated user document
      const updatedUserSnap = await getDoc(userRef);
      console.log('Updated user document after changes:', updatedUserSnap.data());

      // Update email if changed
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update password if provided
      if (formData.newPassword) {
        await updatePassword(user, formData.newPassword);
      }

      console.log('Changes saved successfully');
      toast.success('Changes saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error(error.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      console.log('Attempting to delete account');
      const isReauthenticated = await reauthenticate(formData.currentPassword);
      if (!isReauthenticated) return;

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete Firebase auth user
      await deleteUser(user);
      
      console.log('Account deleted successfully');
      toast.success('Account deleted successfully');
      await logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error('Please enter both current and new password');
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      console.log('User document before password change:', userSnap.data());

      console.log('Attempting to change password');
      const isReauthenticated = await reauthenticate(formData.currentPassword);
      if (!isReauthenticated) return;

      await updatePassword(user, formData.newPassword);
      
      const updatedUserSnap = await getDoc(userRef);
      console.log('User document after password change:', updatedUserSnap.data());

      console.log('Password changed successfully');
      toast.success('Password changed successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        showPasswordChange: false
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
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
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>Account Settings</h2>
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

        {/* Profile Information Section */}
        <form onSubmit={handleSaveChanges}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1d4ed8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Password Section */}
        <div style={{ 
          borderTop: '1px solid #ddd', 
          borderBottom: '1px solid #ddd',
          padding: '24px 0',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Password</h3>
          <button
            onClick={() => setFormData({ ...formData, showPasswordChange: true })}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'white',
              color: '#1d4ed8',
              border: '1px solid #1d4ed8',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Change Password
          </button>
          
          {formData.showPasswordChange && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Current Password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <button
                onClick={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1d4ed8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Update Password
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Danger Zone</h3>
          <button
            onClick={handleDeleteAccount}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: showDeleteConfirm ? '#dc2626' : 'white',
              color: showDeleteConfirm ? 'white' : '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showDeleteConfirm 
              ? 'Are you sure? This will delete all your data' 
              : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
} 