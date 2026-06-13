import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /** Creates a new session row valid for 7 days and returns its id. */
  async create(userId: number): Promise<{ sessionId: string; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const session = await this.prisma.session.create({
      data: {
        id: randomUUID(),
        userId,
        expiresAt,
      },
    });

    return { sessionId: session.id, expiresAt: session.expiresAt };
  }

  /** Returns the session with user when the id exists and is not expired. */
  async findValidSession(sessionId: string) {
    return this.prisma.session.findFirst({
      where: {
        id: sessionId,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  /** Deletes a session by id (logout). */
  async delete(sessionId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
  }
}
