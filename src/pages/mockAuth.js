// Mock authentication service
const mockUsers = [
  { email: 'test@example.com', password: 'password123' }
];

// Mock auth object
export const mockAuth = {
  currentUser: null,
  
  // Sign in with email and password
  signInWithEmailAndPassword: (email, password) => {
    return new Promise((resolve, reject) => {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        mockAuth.currentUser = { email: user.email, uid: '123456' };
        localStorage.setItem('mockUser', JSON.stringify(mockAuth.currentUser));
        resolve(mockAuth.currentUser);
      } else {
        reject(new Error('Invalid email or password'));
      }
    });
  },
  
  // Create user with email and password
  createUserWithEmailAndPassword: (email, password) => {
    return new Promise((resolve, reject) => {
      if (mockUsers.some(u => u.email === email)) {
        reject(new Error('Email already in use'));
        return;
      }
      
      const newUser = { email, password };
      mockUsers.push(newUser);
      
      mockAuth.currentUser = { email, uid: Date.now().toString() };
      localStorage.setItem('mockUser', JSON.stringify(mockAuth.currentUser));
      resolve(mockAuth.currentUser);
    });
  },
  
  // Sign in with Google
  signInWithGoogle: () => {
    return new Promise((resolve) => {
      const googleUser = { email: 'google@example.com', uid: 'google123' };
      mockAuth.currentUser = googleUser;
      localStorage.setItem('mockUser', JSON.stringify(mockAuth.currentUser));
      resolve(googleUser);
    });
  },
  
  // Sign in with Facebook
  signInWithFacebook: () => {
    return new Promise((resolve) => {
      const facebookUser = { email: 'facebook@example.com', uid: 'facebook123' };
      mockAuth.currentUser = facebookUser;
      localStorage.setItem('mockUser', JSON.stringify(mockAuth.currentUser));
      resolve(facebookUser);
    });
  },
  
  // Sign out
  signOut: () => {
    return new Promise((resolve) => {
      mockAuth.currentUser = null;
      localStorage.removeItem('mockUser');
      resolve();
    });
  }
};

// Initialize from localStorage if available
const storedUser = localStorage.getItem('mockUser');
if (storedUser) {
  mockAuth.currentUser = JSON.parse(storedUser);
} 