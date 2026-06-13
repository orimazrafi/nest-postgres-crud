import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionUser } from '../session.service';

/** Reads the authenticated user set by SessionGuard on the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser => {
    const request = ctx.switchToHttp().getRequest<{ user: SessionUser }>();
    return request.user;
  },
);
