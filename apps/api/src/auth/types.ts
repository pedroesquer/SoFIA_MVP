import type { UserRole } from '../../../../packages/domain/src/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sede: string;
}
