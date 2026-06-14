import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OwnerGuard } from './owner.guard';
import { SessionUser } from '../session.service';

describe('OwnerGuard', () => {
  const guard = new OwnerGuard();

  /** Builds a mock HTTP execution context for route param and request.user. */
  function createContext(
    routeId: string,
    user?: SessionUser,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          params: { id: routeId },
          user,
        }),
      }),
    } as ExecutionContext;
  }

  const sessionUser: SessionUser = {
    id: 42,
    email: 'owner@example.com',
    name: 'Owner',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  it('allows access when route id matches the authenticated user', () => {
    expect(guard.canActivate(createContext('42', sessionUser))).toBe(true);
  });

  it('throws ForbiddenException when route id does not match', () => {
    expect(() => guard.canActivate(createContext('99', sessionUser))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when no user is attached to the request', () => {
    expect(() => guard.canActivate(createContext('42'))).toThrow(
      ForbiddenException,
    );
  });
});
