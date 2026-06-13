import { Global, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/** Thin wrapper around ioredis for session storage and other cache use. */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  }

  /** Returns the string value for a key, or null when missing. */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** Sets a key with a TTL in seconds. */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  /** Deletes a key. */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
