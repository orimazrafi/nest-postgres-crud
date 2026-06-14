import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../src/prisma/prisma.service';

/** Clears users and Redis sessions between E2E examples. */
export async function resetTestData(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.user.deleteMany();

  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  await redis.flushdb();
  await redis.quit();
}

/** Generates a unique email for isolated E2E runs. */
export function uniqueEmail(label: string): string {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export const testPassword = 'Password1';
