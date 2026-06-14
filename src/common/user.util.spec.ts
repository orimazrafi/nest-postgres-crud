import { User } from '../generated/prisma/client';
import { excludePassword } from './user.util';

describe('excludePassword', () => {
  it('removes the password field from a user record', () => {
    const user: User = {
      id: 1,
      email: 'user@example.com',
      name: 'User',
      password: 'hashed-password',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    expect(excludePassword(user)).toEqual({
      id: 1,
      email: 'user@example.com',
      name: 'User',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    expect(excludePassword(user)).not.toHaveProperty('password');
  });
});
