import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../pages/firebaseConfig";
import { googleProvider, facebookProvider } from "../pages/firebaseImport";
import { FacebookAuthProvider } from "firebase/auth";

// Password validation regex
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

// Email/password registration
export const registerWithEmailPassword = async (email, password, username) => {
  // Validate password
  if (!passwordRegex.test(password)) {
    throw new Error("Password must be at least 8 characters and include letters, numbers, and special characters");
  }
  
  // Create user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update profile with username
  await updateProfile(user, {
    displayName: username
  });
  
  // Send email verification
  await sendEmailVerification(user);
  
  // Create user document in Firestore
  await createUserDocument(user, { username });
  
  return user;
};

// Email/password login
export const loginWithEmailPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Google login
export const loginWithGoogle = async () => {
  try {
    console.log('Starting Google login process');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google auth successful:', result.user);
    
    try {
      // Create user document if it doesn't exist
      await createUserDocument(result.user, { authProvider: 'google' });
      console.log('User document created successfully');
    } catch (docError) {
      console.error('Error creating user document:', docError);
      // Continue with login even if document creation fails
      // We'll handle this error separately
    }
    
    return result.user;
  } catch (error) {
    console.error('Google login error:', error);
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login canceled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google authentication is not enabled in Firebase. Please contact the administrator.');
    } else {
      throw error;
    }
  }
};

// Facebook login
export const loginWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    
    // Extract user info
    const user = result.user;
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    
    // Get additional user info from Facebook
    let username = user.displayName;
    // If no username is available, create one from email
    if (!username && user.email) {
      username = user.email.split('@')[0];
    }
    
    // Create user document with Facebook profile data
    await createUserDocument(user, { 
      username,
      facebookAccessToken: token,
      authProvider: 'facebook'
    });
    
    return user;
  } catch (error) {
    console.error('Facebook login error:', error);
    
    // Handle specific Facebook auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login canceled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email address but different sign-in credentials. Try signing in with a different method.');
    } else if (error.code === 'auth/auth-domain-config-required') {
      throw new Error('Authentication domain configuration is required. Please contact the administrator.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('The popup has been closed by the user before finalizing the operation.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Facebook authentication is not enabled in Firebase. Please contact the administrator.');
    } else {
      // For any other errors, provide a more generic message
      throw new Error('Facebook authentication failed. Please try another login method.');
    }
  }
};

// Create user document in Firestore
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;
  
  try {
    console.log('Creating user document for:', user.uid);
    const userRef = doc(db, "users", user.uid);
    
    // Extract data from user object
    const { displayName, email, photoURL } = user;
    
    // Create user document with default values
    const userData = {
      displayName: displayName || additionalData.username || '',
      email: email || '',
      photoURL: photoURL || '',
      joinDate: serverTimestamp(),
      allergens: additionalData.allergens || [],
      favoriteRestaurants: [],
      reviewCount: 0,
      connectionCount: 0,
      location: '',
      ...additionalData
    };
    
    // Remove undefined values
    Object.keys(userData).forEach(key => 
      userData[key] === undefined && delete userData[key]
    );
    
    console.log('User document data:', userData);
    
    // Set the user document
    await setDoc(userRef, userData, { merge: true });
    console.log('User document created successfully');
    
    return userRef;
  } catch (error) {
    console.error('Error creating user document:', error);
    
    // If it's a permission error, log it but don't throw
    // This allows the authentication to succeed even if the document creation fails
    if (error.code === 'permission-denied') {
      console.warn('Permission denied when creating user document. Check Firestore rules.');
      return null;
    }
    
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
}; 