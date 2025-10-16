import { createClient, RedisClientType } from 'redis';
import { environment } from '../../config/environment';
import logger from '../../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  serialize?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

export class RedisCacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  };

  constructor() {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      const config = environment.getRedisConfig();
      
      if (!config.url && !config.host) {
        logger.warn('Redis not configured, cache will be disabled');
        return;
      }

      this.client = createClient({
        url: config.url || `redis://${config.host}:${config.port}`,
        password: config.password,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (error) => {
        logger.error('Redis client error', { error: error.message });
        this.stats.errors++;
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis client', { error });
      this.client = null;
      this.isConnected = false;
    }
  }

  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || 'stations';
    return `${keyPrefix}:${key}`;
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      this.stats.misses++;
      return null;
    }

    try {
      const fullKey = this.generateKey(key, options.prefix);
      const value = await this.client.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      
      if (options.serialize !== false) {
        return JSON.parse(value) as T;
      }
      
      return value as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      this.stats.errors++;
      this.stats.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.generateKey(key, options.prefix);
      const ttl = options.ttl || environment.getCacheConfig().ttlSeconds;
      
      let serializedValue: string;
      if (options.serialize !== false) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = value as string;
      }

      await this.client.setEx(fullKey, ttl, serializedValue);
      this.stats.sets++;
      
      logger.debug('Cache set', { key: fullKey, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      this.stats.errors++;
      return false;
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.generateKey(key, options.prefix);
      const result = await this.client.del(fullKey);
      this.stats.deletes++;
      
      logger.debug('Cache delete', { key: fullKey, deleted: result > 0 });
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      this.stats.errors++;
      return false;
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.generateKey(key, options.prefix);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      this.stats.errors++;
      return false;
    }
  }

  async clear(pattern: string = '*', options: CacheOptions = {}): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const fullPattern = this.generateKey(pattern, options.prefix);
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(keys);
      this.stats.deletes += result;
      
      logger.info('Cache cleared', { pattern: fullPattern, deleted: result });
      return result;
    } catch (error) {
      logger.error('Cache clear error', { pattern, error });
      this.stats.errors++;
      return 0;
    }
  }

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async resetStats(): Promise<void> {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed', { error });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  // دوال مساعدة للتخزين المؤقت المتخصص
  async cacheAnalysisResult<T>(
    textHash: string, 
    stationNumber: number, 
    result: T, 
    ttl: number = 3600
  ): Promise<boolean> {
    const key = `analysis:${textHash}:station${stationNumber}`;
    return this.set(key, result, { ttl, prefix: 'stations' });
  }

  async getAnalysisResult<T>(
    textHash: string, 
    stationNumber: number
  ): Promise<T | null> {
    const key = `analysis:${textHash}:station${stationNumber}`;
    return this.get<T>(key, { prefix: 'stations' });
  }

  async invalidateAnalysisResults(textHash: string): Promise<number> {
    const pattern = `analysis:${textHash}:*`;
    return this.clear(pattern, { prefix: 'stations' });
  }

  async cacheUserSession(
    sessionId: string, 
    data: unknown, 
    ttl: number = 86400
  ): Promise<boolean> {
    const key = `session:${sessionId}`;
    return this.set(key, data, { ttl, prefix: 'sessions' });
  }

  async getSessionData(sessionId: string): Promise<unknown | null> {
    const key = `session:${sessionId}`;
    return this.get(key, { prefix: 'sessions' });
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return this.delete(key, { prefix: 'sessions' });
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const cacheService = new RedisCacheService();

