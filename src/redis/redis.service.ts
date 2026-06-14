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

  /** Returns remaining TTL in seconds, or -2 if the key does not exist. */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /** Returns PONG when Redis is reachable. */
  async ping(): Promise<string> {
    return this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
