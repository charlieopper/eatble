import React from 'react';
import '@testing-library/jest-dom';

// Mock all Firebase-related modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  sendEmailVerification: jest.fn(),
  updateProfile: jest.fn(),
  FacebookAuthProvider: {
    credentialFromResult: jest.fn()
  }
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

// Mock the entire firebase app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}));

// Mock the auth service
jest.mock('./services/authService', () => ({
  registerWithEmailPassword: jest.fn(),
  loginWithEmailPassword: jest.fn(),
  loginWithGoogle: jest.fn(),
  loginWithFacebook: jest.fn(),
  createUserDocument: jest.fn(),
}));

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => React.createElement('div', { 'data-testid': 'toast-provider' })
}));

// Mock the router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock the firebaseConfig
jest.mock('./pages/firebaseConfig', () => ({
  auth: {},
  db: {},
}));

// Mock the firebaseImport
jest.mock('./pages/firebaseImport', () => ({
  googleProvider: {},
  facebookProvider: {},
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock import.meta.env
global.import = {
  meta: {
    env: {
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
      VITE_FIREBASE_PROJECT_ID: 'test-project-id',
      VITE_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'test-messaging-sender-id',
      VITE_FIREBASE_APP_ID: 'test-app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'test-measurement-id'
    }
  }
}; 