import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

type HealthCheck = {
  status: 'up' | 'down';
  message?: string;
};

/** Aggregates Postgres and Redis readiness for load balancers and Docker. */
@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Returns overall health and individual dependency checks. */
  async check(): Promise<{
    status: 'ok' | 'error';
    checks: {
      database: HealthCheck;
      redis: HealthCheck;
    };
  }> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const status =
      database.status === 'up' && redis.status === 'up' ? 'ok' : 'error';

    if (status === 'error') {
      throw new ServiceUnavailableException({
        status,
        checks: { database, redis },
      });
    }

    return { status, checks: { database, redis } };
  }

  /** Verifies PostgreSQL accepts connections via Prisma. */
  private async checkDatabase(): Promise<HealthCheck> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Database unavailable',
      };
    }
  }

  /** Verifies Redis responds to PING. */
  private async checkRedis(): Promise<HealthCheck> {
    try {
      const response = await this.redis.ping();
      return response === 'PONG' ? { status: 'up' } : { status: 'down' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Redis unavailable',
      };
    }
  }
}
