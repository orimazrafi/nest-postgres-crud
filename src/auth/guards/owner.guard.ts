import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionUser } from '../session.service';

/** Allows access only when the route :id matches the authenticated user's id. */
@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: SessionUser }>();
    const routeId = Number(request.params.id);

    if (!request.user || request.user.id !== routeId) {
      throw new ForbiddenException('You can only access your own account');
    }

    return true;
  }
}
