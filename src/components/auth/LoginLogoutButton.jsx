import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const LoginLogoutButton = ({ setShowLoginModal }) => {
  const { user } = useAuth();

  console.log('Current auth state:', user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  if (user) {
    console.log('User is logged in:', user.email);
  } else {
    console.log('No user logged in');
  }

  return (
    <button
      onClick={user ? handleLogout : () => setShowLoginModal(true)}
      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      {user ? 'Logout' : 'Login'}
    </button>
  );
}; 