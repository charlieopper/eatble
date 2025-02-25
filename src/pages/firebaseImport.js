// Import Firebase directly
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD27CXgIOOzddupt3VIptop-R9tVVxB-ZU",
  authDomain: "eatable-21edf.firebaseapp.com",
  projectId: "eatable-21edf",
  storageBucket: "eatable-21edf.firebasestorage.app",
  messagingSenderId: "453116360096",
  appId: "1:453116360096:web:385779605892ab708aa0c5",
  measurementId: "G-JZC4SK261L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider(); 