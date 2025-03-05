import { reviewService } from '../reviewService';
import { db } from '../../firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc, 
  getDoc, 
  runTransaction 
} from 'firebase/firestore';

jest.mock('../../firebaseConfig', () => ({
  db: {}
}));

jest.mock('firebase/firestore');

describe('reviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit a review and update restaurant data', async () => {
    // Mock data
    const restaurantId = 'test-restaurant';
    const reviewData = {
      allergens: ['Peanuts', 'Dairy'],
      chefAvailable: true,
      allergenMenuAvailable: true,
      rating: 5,
      reviewText: 'Great experience!'
    };

    // Mock Firestore responses
    const mockReviewRef = { id: 'test-review-id' };
    const mockRestaurantDoc = {
      exists: () => true,
      data: () => ({
        allergenRatings: {
          Peanuts: { total: 8, count: 2, average: 4 }
        },
        accommodations: {}
      })
    };

    // Setup mocks
    addDoc.mockResolvedValue(mockReviewRef);
    runTransaction.mockImplementation(async (db, callback) => {
      await callback({
        get: async () => mockRestaurantDoc,
        update: jest.fn()
      });
    });

    // Execute
    const result = await reviewService.submitReview(restaurantId, reviewData);

    // Verify
    expect(result).toBe('test-review-id');
    expect(addDoc).toHaveBeenCalled();
    expect(runTransaction).toHaveBeenCalled();
  });

  it('should handle errors properly', async () => {
    addDoc.mockRejectedValue(new Error('Failed to submit'));

    await expect(reviewService.submitReview('test-id', {}))
      .rejects
      .toThrow('Failed to submit');
  });
}); 