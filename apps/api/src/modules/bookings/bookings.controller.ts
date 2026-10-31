// ============================================================
// LabShare – Bookings Controller
// ============================================================

import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BookingsService } from './bookings.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { RbacGuard } from '../../common/guards/rbac.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Bookings Workflow')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly db: InMemoryDbService
  ) {}

  @Post()
  @Roles('TEACHER_SPONSOR', 'ADMIN')
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'Submit a new lab booking request with Idempotency-Key support' })
  @ApiHeader({ name: 'Idempotency-Key', required: false, description: 'Client-generated UUID' })
  async createBooking(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
    @CurrentUser('orgId') orgId: string,
    @Headers('idempotency-key') idempotencyKey?: string
  ) {
    return this.bookingsService.createBooking(body, userId, orgId, idempotencyKey)
  }

  @Get()
  @ApiOperation({ summary: 'List bookings scoped by role and organization' })
  async listBookings(
    @CurrentUser('role') role: any,
    @CurrentUser('orgId') orgId: string
  ) {
    if (role === 'ADMIN') {
      return this.db.bookings.map((b) => this.db.findBookingById(b.id)!)
    }
    if (role === 'MANAGER' || role === 'OWNER_SCHOOL') {
      return this.db.findBookingsByHostOrg(orgId)
    }
    // Teacher sponsor / requesting org
    return this.db.findBookingsByOrg(orgId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking detail by ID' })
  async getBookingById(@Param('id') id: string) {
    return this.db.findBookingById(id)
  }

  @Post(':id/action')
  @Roles('MANAGER', 'OWNER_SCHOOL', 'TEACHER_SPONSOR', 'ADMIN')
  @UseGuards(RbacGuard)
  @ApiOperation({
    summary: 'Perform state machine action (APPROVE, REJECT, REQUEST_CHANGES, CANCEL) with optimistic locking',
  })
  async executeAction(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: any,
    @CurrentUser('orgId') orgId: string
  ) {
    return this.bookingsService.executeAction(id, body, userId, role, orgId)
  }

  @Post(':id/vouch')
  @Roles('TEACHER_SPONSOR', 'ADMIN')
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'Execute legally binding teacher sponsor digital declaration' })
  async submitVouch(
    @Param('id') bookingId: string,
    @Body() body: any,
    @CurrentUser('userId') userId: string,
    @Req() req: any
  ) {
    return this.bookingsService.submitVouch({ ...body, bookingId }, userId, req.ip || '127.0.0.1')
  }
}
