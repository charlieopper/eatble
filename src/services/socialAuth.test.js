import { loginWithGoogle, loginWithFacebook } from '../services/authService';
import { signInWithPopup } from 'firebase/auth';
import { auth } from '../pages/firebaseConfig';
import { googleProvider, facebookProvider } from '../pages/firebaseImport';
import { FacebookAuthProvider } from 'firebase/auth';

// Mock Firebase modules
jest.mock('firebase/auth');
jest.mock('../pages/firebaseConfig', () => ({
  auth: {}
}));
jest.mock('../pages/firebaseImport', () => ({
  googleProvider: {},
  facebookProvider: {}
}));

describe('Social Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Google Login', () => {
    it('should login with Google', async () => {
      // Mock user object
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      // Mock Firebase auth function
      signInWithPopup.mockResolvedValue({ user: mockUser });
      
      // Call the function
      const result = await loginWithGoogle();
      
      // Assertions
      expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
      expect(result).toEqual(mockUser);
    });
  });

  describe('Facebook Login', () => {
    it('should login with Facebook', async () => {
      // Mock user object
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      // Mock credential
      const mockCredential = { accessToken: 'test-token' };
      
      // Mock Firebase auth function
      signInWithPopup.mockResolvedValue({ 
        user: mockUser,
        _tokenResponse: {
          firstName: 'Test',
          lastName: 'User'
        }
      });
      
      // Mock credential extraction
      FacebookAuthProvider.credentialFromResult = jest.fn().mockReturnValue(mockCredential);
      
      // Call the function
      const result = await loginWithFacebook();
      
      // Assertions
      expect(signInWithPopup).toHaveBeenCalledWith(auth, facebookProvider);
      expect(result).toEqual(mockUser);
    });
  });
}); 