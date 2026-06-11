import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/** Nest-managed Prisma client wired to PostgreSQL via the Prisma 7 driver adapter. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    // מתחבר לדאטהבייס ברגע שהמודול של Nest עולה לגרם
    await this.$connect();
  }

  async onModuleDestroy() {
    // סוגר את החיבור בצורה נקייה כשהשרת כבה
    await this.$disconnect();
  }
}