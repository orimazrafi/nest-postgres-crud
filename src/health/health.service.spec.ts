import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('HealthService', () => {
  let prisma: { $queryRaw: jest.Mock };
  let redis: { ping: jest.Mock };
  let healthService: HealthService;

  beforeEach(() => {
    prisma = { $queryRaw: jest.fn() };
    redis = { ping: jest.fn() };
    healthService = new HealthService(
      prisma as unknown as PrismaService,
      redis as unknown as RedisService,
    );
  });

  it('returns ok when database and redis are up', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    redis.ping.mockResolvedValue('PONG');

    await expect(healthService.check()).resolves.toEqual({
      status: 'ok',
      checks: {
        database: { status: 'up' },
        redis: { status: 'up' },
      },
    });
  });

  it('throws ServiceUnavailableException when a dependency is down', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
    redis.ping.mockResolvedValue('PONG');

    await expect(healthService.check()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
