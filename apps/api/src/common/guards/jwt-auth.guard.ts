// ============================================================
// LabShare – JWT Auth Guard
// Verifies Bearer JWT access tokens and populates request.user
// ============================================================

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required. Missing Bearer token.')
    }

    const token = authHeader.substring(7)
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_prod_32chars',
      })
      ;(request as any).user = {
        userId: payload.sub,
        phone: payload.phone,
        role: payload.role,
        orgId: payload.orgId,
      }
      return true
    } catch (err: any) {
      throw new UnauthorizedException(`Invalid or expired token: ${err.message}`)
    }
  }
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_prod_32chars',
        })
        ;(request as any).user = {
          userId: payload.sub,
          phone: payload.phone,
          role: payload.role,
          orgId: payload.orgId,
        }
      } catch {
        // Token invalid, continue as unauthenticated guest
      }
    }
    return true
  }
}
