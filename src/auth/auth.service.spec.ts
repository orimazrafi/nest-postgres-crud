import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

describe('AuthService', () => {
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail'>>;
  let sessionService: jest.Mocked<
    Pick<SessionService, 'create' | 'delete'>
  >;
  let authService: AuthService;

  const storedUser: User = {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    password: '',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    storedUser.password = await bcrypt.hash('Password1', 4);

    usersService = {
      findByEmail: jest.fn(),
    };
    sessionService = {
      create: jest.fn(),
      delete: jest.fn(),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      sessionService as unknown as SessionService,
    );
  });

  describe('login', () => {
    it('creates a session when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(storedUser);
      sessionService.create.mockResolvedValue({
        sessionId: 'session-id',
        expiresAt: new Date('2026-02-01T00:00:00.000Z'),
      });

      const result = await authService.login('user@example.com', 'Password1');

      expect(result.sessionId).toBe('session-id');
      expect(sessionService.create).toHaveBeenCalledWith(storedUser);
    });

    it('throws when the email is unknown', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('missing@example.com', 'Password1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when the password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(storedUser);

      await expect(
        authService.login('user@example.com', 'WrongPassword1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deletes the session when a session id is provided', async () => {
      await authService.logout('session-id');

      expect(sessionService.delete).toHaveBeenCalledWith('session-id');
    });

    it('does nothing when the session id is missing', async () => {
      await authService.logout(undefined);

      expect(sessionService.delete).not.toHaveBeenCalled();
    });
  });
});
