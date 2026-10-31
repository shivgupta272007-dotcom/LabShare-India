// ============================================================
// LabShare – Day-of Operations Controller
// Real-time check-in (OTP/QR), actual headcount, damage checkout,
// incident reporting, and manager today schedule.
// ============================================================

import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { randomUUID } from 'node:crypto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { RbacGuard } from '../../common/guards/rbac.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Day-of Operations & Console')
@Controller('ops')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DayOfOpsController {
  constructor(private readonly db: InMemoryDbService) {}

  @Get('today')
  @Roles('MANAGER', 'OWNER_SCHOOL', 'ADMIN')
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: "Get today's real-time schedule for host school manager console" })
  async getTodaySchedule(
    @CurrentUser('orgId') orgId: string,
    @CurrentUser('role') role: string
  ) {
    const todayStr = new Date().toISOString().substring(0, 10)
    let bookings = role === 'ADMIN' ? this.db.bookings : this.db.findBookingsByHostOrg(orgId)

    // Filter to today's date
    const todayList = bookings.filter(
      (b) => b.date === todayStr || ['CHECKED_IN', 'APPROVED'].includes(b.status)
    )

    return {
      date: todayStr,
      totalToday: todayList.length,
      activeNow: todayList.filter((b) => b.status === 'CHECKED_IN').length,
      upcomingToday: todayList.filter((b) => b.status === 'APPROVED').length,
      bookings: todayList,
    }
  }

  @Post('check-in')
  @Roles('MANAGER', 'OWNER_SCHOOL', 'ADMIN')
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'Execute student group check-in via 6-digit OTP or scanned QR code' })
  async checkIn(
    @Body()
    body: {
      bookingId: string
      code: string
      actualHeadcount: number
      supervisingAdultName: string
      supervisingAdultPhone: string
    },
    @CurrentUser('userId') userId: string,
    @CurrentUser('orgId') userOrgId: string,
    @CurrentUser('role') userRole: string
  ) {
    const booking = this.db.findBookingById(body.bookingId)
    if (!booking) throw new NotFoundException('Booking not found.')

    if (userRole !== 'ADMIN' && booking.lab?.organizationId !== userOrgId) {
      throw new ForbiddenException('IDOR Prevention: Managers can only check-in bookings at their own school.')
    }

    if (booking.status !== 'APPROVED') {
      throw new BadRequestException(`Cannot check in booking with status ${booking.status}. Must be APPROVED.`)
    }

    // Verify code
    if (booking.checkInCode && booking.checkInCode !== body.code.trim()) {
      throw new BadRequestException('Invalid 6-digit check-in code.')
    }

    const rawBooking = this.db.bookings.find((b) => b.id === booking.id)
    if (rawBooking) {
      rawBooking.status = 'CHECKED_IN'
      rawBooking.version += 1
      rawBooking.checkInAt = new Date().toISOString()
      rawBooking.actualHeadcount = body.actualHeadcount
      rawBooking.supervisionAdultConfirmed = true
      rawBooking.updatedAt = new Date().toISOString()
    }

    // Add status history
    this.db.statusHistory.push({
      id: randomUUID(),
      bookingId: booking.id,
      fromStatus: 'APPROVED',
      toStatus: 'CHECKED_IN',
      actorId: userId,
      actorRole: userRole as any,
      note: `Checked in. Actual headcount: ${body.actualHeadcount}. Supervisor: ${body.supervisingAdultName}`,
      createdAt: new Date().toISOString(),
    })

    return {
      success: true,
      message: 'Student group check-in confirmed.',
      booking: this.db.findBookingById(booking.id),
    }
  }

  @Post('check-out')
  @Roles('MANAGER', 'OWNER_SCHOOL', 'ADMIN')
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'Execute checkout with damage checklist' })
  async checkOut(
    @Body()
    body: {
      bookingId: string
      damageFlagged: boolean
      damageNotes?: string
    },
    @CurrentUser('userId') userId: string,
    @CurrentUser('orgId') userOrgId: string,
    @CurrentUser('role') userRole: string
  ) {
    const booking = this.db.findBookingById(body.bookingId)
    if (!booking) throw new NotFoundException('Booking not found.')

    if (userRole !== 'ADMIN' && booking.lab?.organizationId !== userOrgId) {
      throw new ForbiddenException('IDOR Prevention: Managers can only checkout bookings at their own school.')
    }

    if (booking.status !== 'CHECKED_IN') {
      throw new BadRequestException(`Cannot checkout booking with status ${booking.status}. Must be CHECKED_IN.`)
    }

    const targetStatus = body.damageFlagged ? 'INCIDENT_FLAGGED' : 'COMPLETED'
    const rawBooking = this.db.bookings.find((b) => b.id === booking.id)
    if (rawBooking) {
      rawBooking.status = targetStatus
      rawBooking.version += 1
      rawBooking.checkOutAt = new Date().toISOString()
      rawBooking.updatedAt = new Date().toISOString()
    }

    this.db.statusHistory.push({
      id: randomUUID(),
      bookingId: booking.id,
      fromStatus: 'CHECKED_IN',
      toStatus: targetStatus,
      actorId: userId,
      actorRole: userRole as any,
      note: body.damageFlagged
        ? `Damage inspection flagged: ${body.damageNotes}`
        : 'Inspection clean. Lab returned in good condition.',
      createdAt: new Date().toISOString(),
    })

    // If damage flagged, auto-generate Incident Report
    if (body.damageFlagged) {
      this.db.incidentReports.push({
        id: randomUUID(),
        bookingId: booking.id,
        reportedByUserId: userId,
        severity: 'MEDIUM',
        title: 'Checkout Damage Flag',
        description: body.damageNotes || 'Equipment damage observed at checkout.',
        evidenceFileIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    return {
      success: true,
      status: targetStatus,
      message: body.damageFlagged
        ? 'Session ended with damage flag. Incident recorded.'
        : 'Session completed successfully. Review invitation issued.',
      booking: this.db.findBookingById(booking.id),
    }
  }

  @Post('incident')
  @Roles('MANAGER', 'OWNER_SCHOOL', 'TEACHER_SPONSOR', 'ADMIN')
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'Report a safety or equipment incident during or after a booking' })
  async reportIncident(
    @Body()
    body: {
      bookingId: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      title: string
      description: string
    },
    @CurrentUser('userId') userId: string
  ) {
    const booking = this.db.findBookingById(body.bookingId)
    if (!booking) throw new NotFoundException('Booking not found.')

    const incident = {
      id: randomUUID(),
      bookingId: body.bookingId,
      reportedByUserId: userId,
      severity: body.severity,
      title: body.title,
      description: body.description,
      evidenceFileIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.db.incidentReports.push(incident)

    // Escalate booking status if not already disputed/flagged
    if (booking.status === 'CHECKED_IN') {
      booking.status = 'INCIDENT_FLAGGED'
      booking.version += 1
    }

    return incident
  }
}
