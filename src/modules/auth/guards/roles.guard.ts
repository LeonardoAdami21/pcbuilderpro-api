import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';

export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    // Hierarquia: SUPERADMIN > ADMIN > USER
    const hierarchy: Record<Role, number> = {
      USER: 1,
      ADMIN: 2,
      SUPERADMIN: 3,
    };

    const userLevel = hierarchy[user?.role as Role] ?? 0;
    const requiredLevel = Math.min(...requiredRoles.map((r) => hierarchy[r]));

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(
        `Acesso negado. Requer role: ${requiredRoles.join(' ou ')}`,
      );
    }

    return true;
  }
}
