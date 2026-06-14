import { ConflictException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  isUniqueConstraintError,
  throwIfUniqueConstraint,
} from './handle-prisma-error';

describe('handle-prisma-error', () => {
  /** Builds a Prisma P2002 error for unit tests. */
  function uniqueConstraintError(): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });
  }

  describe('isUniqueConstraintError', () => {
    it('returns true for Prisma P2002 errors', () => {
      expect(isUniqueConstraintError(uniqueConstraintError())).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(isUniqueConstraintError(new Error('other'))).toBe(false);
    });
  });

  describe('throwIfUniqueConstraint', () => {
    it('throws ConflictException for P2002', () => {
      expect(() => throwIfUniqueConstraint(uniqueConstraintError())).toThrow(
        ConflictException,
      );
      expect(() => throwIfUniqueConstraint(uniqueConstraintError())).toThrow(
        'A user with this email already exists',
      );
    });

    it('rethrows non-unique errors', () => {
      const error = new Error('database unavailable');
      expect(() => throwIfUniqueConstraint(error)).toThrow(error);
    });
  });
});
