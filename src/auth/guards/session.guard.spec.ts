import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from './session.guard';
import { SessionService, SessionUser } from '../session.service';

describe('SessionGuard', () => {
  let sessionService: jest.Mocked<Pick<SessionService, 'findValidSession'>>;
  let guard: SessionGuard;

  const sessionUser: SessionUser = {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  /** Builds a mock HTTP execution context with optional sid cookie. */
  function createContext(
    cookies?: Record<string, string>,
  ): ExecutionContext & { request: { user?: SessionUser; cookies?: Record<string, string> } } {
    const request: {
      user?: SessionUser;
      cookies?: Record<string, string>;
    } = { cookies };

    return {
      request,
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext & {
      request: { user?: SessionUser; cookies?: Record<string, string> };
    };
  }

  beforeEach(() => {
    sessionService = {
      findValidSession: jest.fn(),
    };
    guard = new SessionGuard(sessionService as unknown as SessionService);
  });

  it('throws when the sid cookie is missing', async () => {
    const context = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(sessionService.findValidSession).not.toHaveBeenCalled();
  });

  it('throws when the session is missing in Redis', async () => {
    sessionService.findValidSession.mockResolvedValue(null);
    const context = createContext({ sid: 'session-id' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Session expired or invalid',
    );
  });

  it('attaches the session user to the request when valid', async () => {
    sessionService.findValidSession.mockResolvedValue(sessionUser);
    const context = createContext({ sid: 'session-id' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(context.request.user).toEqual(sessionUser);
  });
});
