import { 
  registerWithEmailPassword, 
  loginWithEmailPassword, 
  loginWithGoogle, 
  loginWithFacebook, 
  createUserDocument 
} from './authService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendEmailVerification, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../pages/firebaseConfig';
import { googleProvider, facebookProvider } from '../pages/firebaseImport';
import { FacebookAuthProvider } from 'firebase/auth';

// Mock Firebase modules
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('../pages/firebaseConfig', () => ({
  auth: {},
  db: {}
}));
jest.mock('../pages/firebaseImport', () => ({
  googleProvider: {},
  facebookProvider: {}
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('registerWithEmailPassword', () => {
    it('should register a user with email and password', async () => {
      // Mock user object
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      // Mock Firebase auth functions
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      updateProfile.mockResolvedValue();
      sendEmailVerification.mockResolvedValue();
      
      // Mock createUserDocument
      jest.spyOn(global, 'createUserDocument').mockResolvedValue();
      
      // Call the function
      const result = await registerWithEmailPassword('test@example.com', 'Password123!', 'testuser');
      
      // Assertions
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'Password123!');
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'testuser' });
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if password does not meet requirements', async () => {
      // Call the function with invalid password
      await expect(registerWithEmailPassword('test@example.com', 'weak', 'testuser'))
        .rejects
        .toThrow('Password must be at least 8 characters and include letters, numbers, and special characters');
      
      // Ensure Firebase functions were not called
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should handle Firebase registration errors', async () => {
      // Mock Firebase error
      const firebaseError = new Error('Firebase error');
      firebaseError.code = 'auth/email-already-in-use';
      createUserWithEmailAndPassword.mockRejectedValue(firebaseError);
      
      // Call the function
      await expect(registerWithEmailPassword('test@example.com', 'Password123!', 'testuser'))
        .rejects
        .toThrow('Firebase error');
      
      // Ensure Firebase functions were called correctly
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'Password123!');
    });
  });

  describe('loginWithEmailPassword', () => {
    it('should login a user with email and password', async () => {
      // Mock user object
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      // Mock Firebase auth function
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      
      // Call the function
      const result = await loginWithEmailPassword('test@example.com', 'Password123!');
      
      // Assertions
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'Password123!');
      expect(result).toEqual(mockUser);
    });

    it('should handle Firebase login errors', async () => {
      // Mock Firebase error
      const firebaseError = new Error('Firebase error');
      firebaseError.code = 'auth/wrong-password';
      signInWithEmailAndPassword.mockRejectedValue(firebaseError);
      
      // Call the function
      await expect(loginWithEmailPassword('test@example.com', 'Password123!'))
        .rejects
        .toThrow('Firebase error');
      
      // Ensure Firebase functions were called correctly
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'Password123!');
    });
  });

  describe('loginWithGoogle', () => {
    it('should login a user with Google', async () => {
      // Mock user object
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      // Mock Firebase auth function
      signInWithPopup.mockResolvedValue({ user: mockUser });
      
      // Mock createUserDocument
      jest.spyOn(global, 'createUserDocument').mockResolvedValue();
      
      // Call the function
      const result = await loginWithGoogle();
      
      // Assertions
      expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
      expect(result).toEqual(mockUser);
    });

    it('should handle Firebase Google login errors', async () => {
      // Mock Firebase error
      const firebaseError = new Error('Firebase error');
      firebaseError.code = 'auth/popup-closed-by-user';
      signInWithPopup.mockRejectedValue(firebaseError);
      
      // Call the function
      await expect(loginWithGoogle())
        .rejects
        .toThrow('Firebase error');
      
      // Ensure Firebase functions were called correctly
      expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
    });
  });

  describe('loginWithFacebook', () => {
    it('should login a user with Facebook', async () => {
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
      
      // Mock createUserDocument
      jest.spyOn(global, 'createUserDocument').mockResolvedValue();
      
      // Call the function
      const result = await loginWithFacebook();
      
      // Assertions
      expect(signInWithPopup).toHaveBeenCalledWith(auth, facebookProvider);
      expect(result).toEqual(mockUser);
    });

    it('should handle Firebase Facebook login errors', async () => {
      // Mock Firebase error
      const firebaseError = new Error('Firebase error');
      firebaseError.code = 'auth/popup-closed-by-user';
      signInWithPopup.mockRejectedValue(firebaseError);
      
      // Call the function
      await expect(loginWithFacebook())
        .rejects
        .toThrow('Firebase error');
      
      // Ensure Firebase functions were called correctly
      expect(signInWithPopup).toHaveBeenCalledWith(auth, facebookProvider);
    });
  });

  describe('createUserDocument', () => {
    it('should create a user document in Firestore', async () => {
      // Mock user object
      const mockUser = { 
        uid: 'test-uid', 
        email: 'test@example.com', 
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };
      
      // Mock Firestore functions
      const mockDocRef = { id: 'test-uid' };
      doc.mockReturnValue(mockDocRef);
      setDoc.mockResolvedValue();
      serverTimestamp.mockReturnValue('mock-timestamp');
      
      // Call the function
      const result = await createUserDocument(mockUser);
      
      // Assertions
      expect(doc).toHaveBeenCalledWith(db, 'users', 'test-uid');
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
        joinDate: 'mock-timestamp',
        allergens: [],
        favoriteRestaurants: [],
        reviewCount: 0,
        connectionCount: 0,
        location: ''
      }, { merge: true });
      expect(result).toEqual(mockDocRef);
    });

    it('should merge additional data with user document', async () => {
      // Mock user object
      const mockUser = { 
        uid: 'test-uid', 
        email: 'test@example.com', 
        displayName: 'Test User'
      };
      
      // Additional data
      const additionalData = {
        username: 'testuser',
        allergens: ['Peanuts', 'Dairy'],
        authProvider: 'google'
      };
      
      // Mock Firestore functions
      const mockDocRef = { id: 'test-uid' };
      doc.mockReturnValue(mockDocRef);
      setDoc.mockResolvedValue();
      serverTimestamp.mockReturnValue('mock-timestamp');
      
      // Call the function
      const result = await createUserDocument(mockUser, additionalData);
      
      // Assertions
      expect(doc).toHaveBeenCalledWith(db, 'users', 'test-uid');
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: '',
        joinDate: 'mock-timestamp',
        allergens: ['Peanuts', 'Dairy'],
        favoriteRestaurants: [],
        reviewCount: 0,
        connectionCount: 0,
        location: '',
        username: 'testuser',
        authProvider: 'google'
      }, { merge: true });
      expect(result).toEqual(mockDocRef);
    });

    it('should handle Firestore errors', async () => {
      // Mock user object
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      // Mock Firestore error
      const firestoreError = new Error('Firestore error');
      firestoreError.code = 'permission-denied';
      doc.mockReturnValue({});
      setDoc.mockRejectedValue(firestoreError);
      
      // Call the function
      const result = await createUserDocument(mockUser);
      
      // Assertions
      expect(doc).toHaveBeenCalledWith(db, 'users', 'test-uid');
      expect(result).toBeNull();
    });

    it('should throw non-permission errors', async () => {
      // Mock user object
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      // Mock Firestore error
      const firestoreError = new Error('Firestore error');
      firestoreError.code = 'unavailable';
      doc.mockReturnValue({});
      setDoc.mockRejectedValue(firestoreError);
      
      // Call the function
      await expect(createUserDocument(mockUser))
        .rejects
        .toThrow('Failed to create user profile: Firestore error');
      
      // Assertions
      expect(doc).toHaveBeenCalledWith(db, 'users', 'test-uid');
    });

    it('should return early if no user is provided', async () => {
      // Call the function with no user
      const result = await createUserDocument(null);
      
      // Assertions
      expect(result).toBeUndefined();
      expect(doc).not.toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
    });
  });
}); 