import { ConflictException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

/** Returns true when Prisma reports a unique-constraint violation (P2002). */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

/** Maps a Prisma unique violation to HTTP 409; rethrows any other error. */
export function throwIfUniqueConstraint(
  error: unknown,
  message = 'A user with this email already exists',
): never {
  if (isUniqueConstraintError(error)) {
    throw new ConflictException(message);
  }
  throw error;
}
