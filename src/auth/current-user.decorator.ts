import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthUser } from './auth-user.type';
import { AuthenticatedRequest } from './auth-request.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    if (ctx.getType<'http' | 'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      const req = gqlCtx.getContext<{ req: AuthenticatedRequest }>().req;
      return req.user as AuthUser;
    }

    return ctx.switchToHttp().getRequest<AuthenticatedRequest>()
      .user as AuthUser;
  },
);
