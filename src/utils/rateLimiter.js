export class RateLimiter {
  constructor(maxTokens = 100, refillInterval = 3600000) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillInterval = refillInterval;
  }

  async acquireToken() {
    if (Date.now() - this.lastRefill > this.refillInterval) {
      this.tokens = this.maxTokens;
      this.lastRefill = Date.now();
    }

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }

    throw new Error('API rate limit exceeded. Please try again later.');
  }
} 