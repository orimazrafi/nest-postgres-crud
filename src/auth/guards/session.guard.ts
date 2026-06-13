import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { excludePassword } from '../../common/user.util';
import { SessionService } from '../session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  /** Validates the sid cookie against active sessions in the database. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sid as string | undefined;

    if (!sessionId) {
      throw new UnauthorizedException('Authentication required');
    }

    const session = await this.sessionService.findValidSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    request.user = excludePassword(session.user);
    return true;
  }
}
