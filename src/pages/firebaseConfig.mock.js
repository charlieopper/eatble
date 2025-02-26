export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn(); // Return unsubscribe function
  })
};

export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: false,
        data: () => ({})
      })),
      set: jest.fn(() => Promise.resolve())
    }))
  }))
}; 