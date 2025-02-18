// Redis utility functions to simplify caching operations.
import { RedisAdapter } from '../redisAdapter';

export class RedisUtils {
  private redisAdapter: RedisAdapter;

  constructor(redisAdapter: RedisAdapter) {
    this.redisAdapter = redisAdapter;
  }

  async cacheSet(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await this.redisAdapter.set(key, value, ttl);
    } catch (error) {
      console.error(`Failed to set cache for key ${key}:`, error);
    }
  }

  async cacheGet(key: string): Promise<string | null> {
    try {
      return await this.redisAdapter.get(key);
    } catch (error) {
      console.error(`Failed to get cache for key ${key}:`, error);
      return null;
    }
  }

  async cacheDelete(key: string): Promise<void> {
    try {
      // Await the result of isConnection() before evaluating
      const isConnected = await this.redisAdapter.isConnection();
      if (isConnected) {
        await this.redisAdapter.deleteKey(key);
      }
    } catch (error) {
      console.error(`Failed to delete cache for key ${key}:`, error);
    }
  }
}
