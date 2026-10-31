// ============================================================
// LabShare – Auth Controller
// ============================================================

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Auth & Identity')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly db: InMemoryDbService
  ) {}

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to mobile phone number' })
  async sendOtp(@Body() body: { phone: string }, @Req() req: any) {
    return this.authService.sendOtp(body.phone, req.ip)
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and retrieve JWT token pair' })
  async verifyOtp(@Body() body: { phone: string; otp: string }) {
    return this.authService.verifyOtp(body.phone, body.otp)
  }

  @Post('token/refresh')
  @ApiOperation({ summary: 'Exchange refresh token for a new access token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken)
  }

  @Post('demo-switch')
  @ApiOperation({ summary: 'Quick switch to demo role (for judging & review)' })
  async switchDemoRole(@Body() body: { role: string }) {
    return this.authService.switchDemoRole(body.role as any)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and memberships' })
  async getMe(@CurrentUser('userId') userId: string) {
    const user = this.db.findUserById(userId)
    const memberships = this.db.findMembershipsByUserId(userId)
    return {
      user,
      memberships,
      activeMembership: memberships[0],
    }
  }
}
