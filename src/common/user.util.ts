import { User } from '../generated/prisma/client';

/** Omits password from a User record for safe API responses and request.user. */
export function excludePassword(user: User): Omit<User, 'password'> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
