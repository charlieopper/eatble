import { Restaurant } from './Restaurant';
import { Review } from '../review/Review';

export class RestaurantAggregate {
  private restaurant: Restaurant;
  private reviews: Review[];

  constructor(restaurant: Restaurant, reviews: Review[] = []) {
    this.restaurant = restaurant;
    this.reviews = reviews;
  }

  public addReview(review: Review): void {
    this.reviews.push(review);
    this.recalculateRating();
  }

  private recalculateRating(): void {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.restaurant.ratings.average = total / this.reviews.length;
    this.restaurant.ratings.count = this.reviews.length;
  }
} 