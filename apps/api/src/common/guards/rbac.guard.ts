// ============================================================
// LabShare – Role-Based Access Control (RBAC) Guard
// Scoped by organization tenancy & role authorization
// ============================================================

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@labshare/shared'
import { ROLES_KEY } from '../decorators/roles.decorator.js'

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: user has no active organization role.')
    }

    // Platform Super Admin has access to all operational views
    if (user.role === 'ADMIN') {
      return true
    }

    const hasRole = requiredRoles.includes(user.role)
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: required role (${requiredRoles.join(', ')}), current role (${user.role}).`
      )
    }

    return true
  }
}
