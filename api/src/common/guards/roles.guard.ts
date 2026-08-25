import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; role: UserRole } | undefined;

    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied: insufficient permissions',
      });
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied: insufficient permissions',
      });
    }

    return true;
  }
}
