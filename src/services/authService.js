import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Password validation regex
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

// Create or update user document
const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.username || '',
      photoURL: user.photoURL || '',
      joinDate: new Date().toISOString(),
      reviewCount: 0,
      connectionCount: 0,
      favoriteRestaurants: [],
      allergens: [],
      location: '',
      ...additionalData
    };

    await setDoc(userRef, userData);
    return userData;
  }

  return userSnap.data();
};

// Email/password registration
export const registerWithEmailPassword = async (email, password, username) => {
  if (!passwordRegex.test(password)) {
    throw new Error("Password must be at least 8 characters and include letters, numbers, and special characters");
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await updateProfile(user, {
    displayName: username
  });
  
  await sendEmailVerification(user);
  await createUserDocument(user, { username });
  
  return user;
};

// Email/password login
export const loginWithEmailPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await createUserDocument(userCredential.user);
  return userCredential.user;
};

// Google login
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// Facebook login
export const loginWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createUserDocument(result.user);
  return result.user;
};

// Logout
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}; 