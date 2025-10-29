/**
 * In-memory LRU cache for AI processing results
 * Reduces redundant API calls for identical inputs
 */

import crypto from 'crypto';
import { AIProvider, VibeSpec } from '../types';

interface CacheEntry {
  key: string;
  value: VibeSpec;
  timestamp: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
}

export class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private stats: CacheStats;

  constructor(maxSize: number = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = {
      size: 0,
      maxSize,
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  /**
   * Generate cache key from input text and provider
   */
  private generateKey(input: string, provider: AIProvider, model: string): string {
    // Normalize input: trim and lowercase for consistency
    const normalized = input.trim().toLowerCase();

    // Include provider and model in key to handle different processing results
    const data = `${normalized}::${provider}::${model}`;

    // Use SHA256 for consistent hashing
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get a value from cache
   */
  get(input: string, provider: AIProvider, model: string): VibeSpec | null {
    const key = this.generateKey(input, provider, model);
    const entry = this.cache.get(key);

    if (entry) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, entry);
      this.stats.hits++;
      return entry.value;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set a value in cache
   */
  set(input: string, provider: AIProvider, model: string, value: VibeSpec): void {
    const key = this.generateKey(input, provider, model);

    // If already exists, remove it first (we'll re-add it as most recent)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }

    // Add new entry
    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate as a percentage
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return (this.stats.hits / total) * 100;
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if cache has an entry for given input
   */
  has(input: string, provider: AIProvider, model: string): boolean {
    const key = this.generateKey(input, provider, model);
    return this.cache.has(key);
  }
}

// Singleton instance
let instance: LRUCache | null = null;

export function getCache(): LRUCache {
  if (!instance) {
    instance = new LRUCache(50);
  }
  return instance;
}
