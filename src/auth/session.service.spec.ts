import { User } from '../generated/prisma/client';
import { RedisService } from '../redis/redis.service';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let redis: jest.Mocked<Pick<RedisService, 'set' | 'get' | 'del' | 'ttl'>>;
  let sessionService: SessionService;

  const user: User = {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    password: 'hashed-password',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    redis = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      ttl: jest.fn(),
    };
    sessionService = new SessionService(redis as unknown as RedisService);
  });

  describe('create', () => {
    it('stores session user data in Redis with a 7-day TTL', async () => {
      const result = await sessionService.create(user);

      expect(result.sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(redis.set).toHaveBeenCalledWith(
        `session:${result.sessionId}`,
        expect.not.stringContaining('hashed-password'),
        7 * 24 * 60 * 60,
      );
    });
  });

  describe('findValidSession', () => {
    it('returns null when Redis has no session', async () => {
      redis.get.mockResolvedValue(null);

      await expect(
        sessionService.findValidSession('missing-session'),
      ).resolves.toBeNull();
    });

    it('returns parsed session user data when present', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          id: 1,
          email: 'user@example.com',
          name: 'User',
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }),
      );

      await expect(sessionService.findValidSession('session-id')).resolves.toEqual(
        expect.objectContaining({
          id: 1,
          email: 'user@example.com',
        }),
      );
    });
  });

  describe('delete', () => {
    it('removes the session key from Redis', async () => {
      await sessionService.delete('session-id');

      expect(redis.del).toHaveBeenCalledWith('session:session-id');
    });
  });

  describe('refreshSession', () => {
    it('rewrites session data while preserving the remaining TTL', async () => {
      redis.ttl.mockResolvedValue(3600);

      await sessionService.refreshSession('session-id', user);

      expect(redis.set).toHaveBeenCalledWith(
        'session:session-id',
        expect.not.stringContaining('hashed-password'),
        3600,
      );
    });

    it('does nothing when the session key has expired', async () => {
      redis.ttl.mockResolvedValue(-2);

      await sessionService.refreshSession('session-id', user);

      expect(redis.set).not.toHaveBeenCalled();
    });
  });
});
