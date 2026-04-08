import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { AuthenticatedRequest } from './auth-request.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request =
      context.getType<'http' | 'graphql'>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext<{
            req: AuthenticatedRequest;
          }>().req
        : context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return !!user && requiredRoles.includes(user.role);
  }
}
