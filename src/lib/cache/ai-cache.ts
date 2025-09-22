import LRU from 'lru-cache';
import { createHash } from 'crypto';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  enableCompression?: boolean;
}

export class AIResponseCache {
  private cache: LRU<string, CacheEntry>;
  private defaultTTL: number;
  private enableCompression: boolean;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRU({
      max: options.maxSize || 1000,
      maxSize: 50 * 1024 * 1024, // 50MB max cache size
      sizeCalculation: (value: CacheEntry) => {
        return JSON.stringify(value).length;
      },
    });
    
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour default
    this.enableCompression = options.enableCompression || false;
  }

  /**
   * Generate cache key from input parameters
   */
  private generateCacheKey(input: any, model?: string, temperature?: number): string {
    const keyData = {
      input: typeof input === 'string' ? input : JSON.stringify(input),
      model: model || 'default',
      temperature: temperature || 0.7,
    };
    
    return createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex');
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Get cached AI response
   */
  async get(input: any, model?: string, temperature?: number): Promise<any | null> {
    const key = this.generateCacheKey(input, model, temperature);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (!this.isValidEntry(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access time for LRU
    this.cache.set(key, entry);
    
    return entry.data;
  }

  /**
   * Store AI response in cache
   */
  async set(
    input: any, 
    response: any, 
    model?: string, 
    temperature?: number, 
    customTTL?: number
  ): Promise<void> {
    const key = this.generateCacheKey(input, model, temperature);
    const entry: CacheEntry = {
      data: response,
      timestamp: Date.now(),
      ttl: customTTL || this.defaultTTL,
    };
    
    this.cache.set(key, entry);
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
      hitRate: this.cache.size > 0 ? (this.cache.size / (this.cache.size + 1)) : 0,
    };
  }

  /**
   * Preload common AI responses
   */
  async preloadCommonResponses(): Promise<void> {
    const commonTasks = [
      'Create user authentication',
      'Set up database',
      'Implement API endpoints',
      'Add unit tests',
      'Deploy to production',
    ];

    // This would typically call your AI service
    // For now, we'll just set up placeholder responses
    for (const task of commonTasks) {
      const mockResponse = {
        category: 'development',
        priority: 'medium',
        estimatedHours: 4,
        tags: ['backend'],
        dependencies: [],
        confidence: 0.8,
      };
      
      await this.set(task, mockResponse, 'gpt-4', 0.7, this.defaultTTL * 2);
    }
  }
}

// Singleton instance
export const aiCache = new AIResponseCache({
  maxSize: 2000,
  defaultTTL: 3600000, // 1 hour
  enableCompression: true,
});

// Cache middleware for AI requests
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey: (...args: T) => string,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const key = cacheKey(...args);
    
    // Try to get from cache first
    const cached = await aiCache.get(key);
    if (cached) {
      return cached;
    }
    
    // Execute function and cache result
    const result = await fn(...args);
    await aiCache.set(key, result, undefined, undefined, ttl);
    
    return result;
  };
}