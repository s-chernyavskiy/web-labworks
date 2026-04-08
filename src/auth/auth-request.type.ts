import type { Request } from 'express';
import type { AuthUser } from './auth-user.type';

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
