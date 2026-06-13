import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { excludePassword } from '../common/user.util';
import { User } from '../generated/prisma/client';
import { RedisService } from '../redis/redis.service';

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const SESSION_KEY_PREFIX = 'session:';

export type SessionUser = Omit<User, 'password'>;

@Injectable()
export class SessionService {
  constructor(private redis: RedisService) {}

  /** Stores session user data in Redis for 7 days and returns the session id. */
  async create(user: User): Promise<{ sessionId: string; expiresAt: Date }> {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
    const sessionUser = excludePassword(user);

    await this.redis.set(
      `${SESSION_KEY_PREFIX}${sessionId}`,
      JSON.stringify(sessionUser),
      SESSION_TTL_SECONDS,
    );

    return { sessionId, expiresAt };
  }

  /** Returns cached user data when the session id exists in Redis. */
  async findValidSession(sessionId: string): Promise<SessionUser | null> {
    const raw = await this.redis.get(`${SESSION_KEY_PREFIX}${sessionId}`);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SessionUser;
  }

  /** Removes a session from Redis (logout). */
  async delete(sessionId: string): Promise<void> {
    await this.redis.del(`${SESSION_KEY_PREFIX}${sessionId}`);
  }
}
