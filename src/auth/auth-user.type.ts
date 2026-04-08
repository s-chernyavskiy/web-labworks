import { UserRole } from '../users/entities/user-role.enum';

export type AuthUser = {
  id: number;
  role: UserRole;
};
