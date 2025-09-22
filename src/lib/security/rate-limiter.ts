import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
  requests: number[];
}

class RateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Get client identifier from request
   */
  private getClientId(req: NextRequest): string {
    // Try to get IP from various headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
    
    // Include user agent for additional uniqueness
    const userAgent = req.headers.get('user-agent') || '';
    const userAgentHash = this.simpleHash(userAgent);
    
    return `${ip}:${userAgentHash}`;
  }

  /**
   * Simple hash function for user agent
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if request is allowed
   */
  async isAllowed(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    total: number;
  }> {
    const clientId = this.getClientId(req);
    const now = Date.now();
    
    let record = this.store.get(clientId);
    
    // Initialize or reset if window expired
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.config.windowMs,
        requests: [],
      };
      this.store.set(clientId, record);
    }
    
    // Clean old requests from sliding window
    record.requests = record.requests.filter(
      timestamp => timestamp > now - this.config.windowMs
    );
    
    const allowed = record.requests.length < this.config.maxRequests;
    
    if (allowed) {
      record.requests.push(now);
      record.count = record.requests.length;
    }
    
    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - record.requests.length),
      resetTime: record.resetTime,
      total: this.config.maxRequests,
    };
  }

  /**
   * Create middleware function
   */
  middleware() {
    return async (req: NextRequest) => {
      const result = await this.isAllowed(req);
      
      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: this.config.message,
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }
      
      // Add rate limit headers to successful requests
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      return response;
    };
  }

  /**
   * Cleanup expired records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const generalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
});

export const aiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Too many AI requests, please wait before making another request.',
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later.',
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3,
  message: 'Too many upload requests, please wait before uploading again.',
});

// Cleanup expired records every 5 minutes
setInterval(() => {
  generalRateLimiter.cleanup();
  aiRateLimiter.cleanup();
  authRateLimiter.cleanup();
  uploadRateLimiter.cleanup();
}, 5 * 60 * 1000);

/**
 * Advanced rate limiter with different strategies
 */
export class AdvancedRateLimiter {
  private tokenBuckets = new Map<string, TokenBucket>();
  private slidingWindows = new Map<string, SlidingWindow>();

  /**
   * Token bucket rate limiting
   */
  async checkTokenBucket(
    key: string,
    capacity: number,
    refillRate: number,
    tokensRequested: number = 1
  ): Promise<boolean> {
    let bucket = this.tokenBuckets.get(key);
    
    if (!bucket) {
      bucket = new TokenBucket(capacity, refillRate);
      this.tokenBuckets.set(key, bucket);
    }
    
    return bucket.consume(tokensRequested);
  }

  /**
   * Sliding window rate limiting
   */
  async checkSlidingWindow(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<boolean> {
    let window = this.slidingWindows.get(key);
    
    if (!window) {
      window = new SlidingWindow(windowMs, maxRequests);
      this.slidingWindows.set(key, window);
    }
    
    return window.isAllowed();
  }
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private capacity: number;
  private refillRate: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(tokens: number): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / 1000) * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

class SlidingWindow {
  private requests: number[] = [];
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(): boolean {
    const now = Date.now();
    
    // Remove old requests
    this.requests = this.requests.filter(
      timestamp => timestamp > now - this.windowMs
    );
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
}

export const advancedRateLimiter = new AdvancedRateLimiter();