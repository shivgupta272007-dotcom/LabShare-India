// ============================================================
// LabShare – Auth Service
// OTP verification, JWT generation, Refresh token rotation, Brute-force lockout
// ============================================================

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'node:crypto'
import { DEMO_ACCOUNTS, DEMO_OTP, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS, UserRole } from '@labshare/shared'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly db: InMemoryDbService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Request OTP
   */
  async sendOtp(phone: string, ip?: string): Promise<{ success: boolean; message: string; demoOtp?: string }> {
    let user = this.db.findUserByPhone(phone)

    // In demo mode or if user is unknown in prototype, auto-register as Teacher Sponsor
    if (!user) {
      user = {
        id: randomUUID(),
        phone,
        name: `User ${phone.substring(6)}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.db.users.push(user)
    }

    const isDemo = process.env.DEMO_MODE === 'true' || DEMO_ACCOUNTS.some((d) => d.phone === phone)
    const otp = isDemo ? DEMO_OTP : Math.floor(100000 + Math.random() * 900000).toString()

    this.db.otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
    })

    return {
      success: true,
      message: `OTP sent to ${phone}`,
      demoOtp: isDemo ? otp : undefined,
    }
  }

  /**
   * Verify OTP & Issue Token Pair
   */
  async verifyOtp(
    phone: string,
    otp: string
  ): Promise<{ accessToken: string; refreshToken: string; user: any; memberships: any[] }> {
    const record = this.db.otpStore.get(phone)
    if (!record) {
      throw new BadRequestException('No OTP requested for this phone number. Please click Send OTP.')
    }

    if (Date.now() > record.expiresAt) {
      this.db.otpStore.delete(phone)
      throw new BadRequestException('OTP has expired. Please request a new one.')
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      this.db.otpStore.delete(phone)
      throw new ForbiddenException('Too many incorrect attempts. Account locked for 30 minutes.')
    }

    if (record.otp !== otp) {
      record.attempts += 1
      throw new BadRequestException(`Invalid OTP. ${OTP_MAX_ATTEMPTS - record.attempts} attempts remaining.`)
    }

    // Clear OTP
    this.db.otpStore.delete(phone)

    const user = this.db.findUserByPhone(phone)
    if (!user) {
      throw new UnauthorizedException('User account not found.')
    }

    const memberships = this.db.findMembershipsByUserId(user.id)
    const primaryMembership = memberships[0]

    // Create JWT
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: primaryMembership?.role || ('TEACHER_SPONSOR' as UserRole),
      orgId: primaryMembership?.organizationId,
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_prod_32chars',
      expiresIn: '2h',
    })

    const refreshToken = randomUUID()
    this.db.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    })

    return {
      accessToken,
      refreshToken,
      user,
      memberships,
    }
  }

  /**
   * Refresh Token
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const record = this.db.refreshTokens.get(token)
    if (!record || record.isRevoked || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired. Please sign in again.')
    }

    const user = this.db.findUserById(record.userId)
    if (!user) {
      throw new UnauthorizedException('User not found.')
    }

    const memberships = this.db.findMembershipsByUserId(user.id)
    const primaryMembership = memberships[0]

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: primaryMembership?.role,
      orgId: primaryMembership?.organizationId,
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_prod_32chars',
      expiresIn: '2h',
    })

    return { accessToken }
  }

  /**
   * Switch Active Role / Org (for demo switcher)
   */
  async switchDemoRole(role: UserRole): Promise<{ accessToken: string; user: any; activeRole: UserRole }> {
    const demo = DEMO_ACCOUNTS.find((d) => d.role === role) || DEMO_ACCOUNTS[0]
    const user = this.db.findUserByPhone(demo.phone)
    if (!user) {
      throw new BadRequestException('Demo user not found.')
    }

    const memberships = this.db.findMembershipsByUserId(user.id)
    const primary = memberships[0]

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: primary?.role || role,
      orgId: primary?.organizationId,
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_prod_32chars',
      expiresIn: '2h',
    })

    return {
      accessToken,
      user,
      activeRole: (primary?.role || role) as UserRole,
    }
  }
}
