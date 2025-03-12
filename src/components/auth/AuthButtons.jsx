import { signOut } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AuthButtons = ({ setShowLoginModal, setShowRegisterModal }) => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <div>
      {user ? (
        <button 
          onClick={handleLogout}
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
          Logout
        </button>
      ) : (
        <>
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
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Register
          </button>
        </>
      )}
    </div>
  );
}; 