import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let prisma: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let usersService: UsersService;

  const userRecord = {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    password: 'hashed-password',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    usersService = new UsersService(prisma as unknown as PrismaService);
  });

  describe('signUp', () => {
    it('returns a user without the password hash', async () => {
      prisma.user.create.mockResolvedValue(userRecord);

      await expect(
        usersService.signUp({
          email: 'user@example.com',
          password: 'Password1',
          name: 'User',
        }),
      ).resolves.toEqual({
        id: 1,
        email: 'user@example.com',
        name: 'User',
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
      });
    });

    it('maps duplicate email errors to ConflictException', async () => {
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.8.0',
        }),
      );

      await expect(
        usersService.signUp({
          email: 'user@example.com',
          password: 'Password1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(usersService.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('maps duplicate email errors to ConflictException', async () => {
      prisma.user.findUnique.mockResolvedValue(userRecord);
      prisma.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.8.0',
        }),
      );

      await expect(
        usersService.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
