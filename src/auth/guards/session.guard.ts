import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  /** Validates the sid cookie against the session stored in Redis. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sid as string | undefined;

    if (!sessionId) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.sessionService.findValidSession(sessionId);

    if (!user) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    request.user = user;
    return true;
  }
}
