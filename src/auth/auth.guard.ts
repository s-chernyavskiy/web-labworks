import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from './public.decorator';
import { User } from '../users/entities/user.entity';
import { AuthenticatedRequest } from './auth-request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = this.getRequest(context);
    const rawUserId = request.headers['user-id'];
    const normalizedUserId = Array.isArray(rawUserId)
      ? rawUserId[0]
      : rawUserId;
    const userId = Number.parseInt(normalizedUserId ?? '', 10);
    if (!Number.isFinite(userId) || userId <= 0) {
      throw new UnauthorizedException('Missing user-id header');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user === null) {
      throw new UnauthorizedException('Unknown user');
    }

    request.user = { id: user.id, role: user.role };
    return true;
  }

  private getRequest(context: ExecutionContext): AuthenticatedRequest {
    if (context.getType<'http' | 'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const gqlContext = gqlCtx.getContext<{ req: AuthenticatedRequest }>();
      return gqlContext.req;
    }
    return context.switchToHttp().getRequest<AuthenticatedRequest>();
  }
}
