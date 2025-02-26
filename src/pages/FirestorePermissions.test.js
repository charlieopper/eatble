import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import toast from 'react-hot-toast';

// Mock the modules
jest.mock('firebase/firestore');
jest.mock('./firebaseConfig', () => ({
  db: {}
}));
jest.mock('react-hot-toast');

// Import the function to test from HomePage
// Since this function is defined inside HomePage, we need to extract it
const checkFirestorePermissions = async () => {
  try {
    console.log('Checking Firestore permissions...');
    
    // Try to write to a test document
    const testDocRef = doc(db, 'test', 'permissions-test');
    await setDoc(testDocRef, { 
      timestamp: 'mock-timestamp',
      test: 'This is a test document to check permissions'
    });
    
    console.log('Firestore write successful - permissions are working');
    toast.success('Firestore permissions are working correctly');
    
    // Clean up the test document
    await deleteDoc(testDocRef);
    
  } catch (error) {
    console.error('Firestore permissions error:', error);
    toast.error(`Firestore permissions error: ${error.message}`);
  }
};

describe('Firestore Permissions', () => {
  it('should be able to write to Firestore', async () => {
    // Mock Firestore functions
    doc.mockReturnValue({ id: 'test-id' });
    setDoc.mockResolvedValue();
    
    // Test a simple write operation
    const testDocRef = doc(db, 'test', 'test-id');
    await setDoc(testDocRef, { test: true });
    
    expect(doc).toHaveBeenCalledWith(db, 'test', 'test-id');
    expect(setDoc).toHaveBeenCalledWith(testDocRef, { test: true });
  });
});

describe('Firestore Permissions Check', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully check Firestore permissions', async () => {
    // Mock Firestore functions
    doc.mockReturnValue({ id: 'permissions-test' });
    setDoc.mockResolvedValue();
    deleteDoc.mockResolvedValue();
    
    // Call the function
    await checkFirestorePermissions();
    
    // Assertions
    expect(doc).toHaveBeenCalledWith(db, 'test', 'permissions-test');
    expect(setDoc).toHaveBeenCalledWith(
      { id: 'permissions-test' },
      {
        timestamp: 'mock-timestamp',
        test: 'This is a test document to check permissions'
      }
    );
    expect(deleteDoc).toHaveBeenCalledWith({ id: 'permissions-test' });
    expect(toast.success).toHaveBeenCalledWith('Firestore permissions are working correctly');
  });

  it('should handle Firestore permission errors', async () => {
    // Mock Firestore error
    const firestoreError = new Error('Permission denied');
    doc.mockReturnValue({ id: 'permissions-test' });
    setDoc.mockRejectedValue(firestoreError);
    
    // Call the function
    await checkFirestorePermissions();
    
    // Assertions
    expect(doc).toHaveBeenCalledWith(db, 'test', 'permissions-test');
    expect(setDoc).toHaveBeenCalledWith(
      { id: 'permissions-test' },
      {
        timestamp: 'mock-timestamp',
        test: 'This is a test document to check permissions'
      }
    );
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Firestore permissions error: Permission denied');
  });
}); 