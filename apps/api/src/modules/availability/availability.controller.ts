// ============================================================
// LabShare – Availability & Rules Evaluation Controller
// ============================================================

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { computeAvailability, evaluateRules } from '@labshare/shared'
import { InMemoryDbService } from '../../storage/in-memory-db.js'
import { OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'

@ApiTags('Availability & Rules Engine')
@Controller()
export class AvailabilityController {
  constructor(private readonly db: InMemoryDbService) {}

  @Get('labs/:id/availability')
  @ApiOperation({ summary: 'Compute live open slots for a specific lab and date' })
  @ApiQuery({ name: 'date', required: true, example: '2026-11-06' })
  async getAvailability(
    @Param('id') labId: string,
    @Query('date') date: string
  ) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Query param "date" is required in YYYY-MM-DD format.')
    }

    const lab = this.db.findLabById(labId)
    if (!lab) {
      throw new NotFoundException(`Lab with ID ${labId} not found.`)
    }

    const rules = lab.currentRules || this.db.labRules.find((r) => r.labId === labId)
    if (!rules) {
      throw new BadRequestException('Lab has no active rules configured.')
    }

    const confirmedBookings = this.db.bookings.filter(
      (b) => b.labId === labId && ['APPROVED', 'CHECKED_IN', 'PENDING_MANAGER'].includes(b.status)
    )

    return computeAvailability({
      labId,
      date,
      rules,
      blackouts: [],
      confirmedBookings,
      bufferMinutes: 15,
      slotDurationMinutes: 60,
    })
  }

  @Post('rules/evaluate')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Pure rules engine evaluation: returns instant bilingual pass/fail/review verdict and reasons',
  })
  async evaluateBookingRules(@Body() body: any) {
    const { labId, studentGroupId, date, startTime, endTime, headcount, equipmentRequested, orgId } = body

    const lab = this.db.findLabById(labId)
    if (!lab) {
      throw new NotFoundException('Lab not found.')
    }

    const rules = lab.currentRules || this.db.labRules.find((r) => r.labId === labId)
    if (!rules) {
      throw new BadRequestException('Lab has no active rules.')
    }

    const group = this.db.studentGroups.find((g) => g.id === studentGroupId) || {
      id: 'preview-group',
      organizationId: orgId || 'preview-org',
      sponsorUserId: 'preview-user',
      name: 'Preview Student Group',
      headcount: headcount || 20,
      classRangeMin: 7,
      classRangeMax: 8,
      emergencyContactName: 'Preview Contact',
      emergencyContactPhone: '9000000005',
      emergencyContactRelation: 'Teacher',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const org = this.db.findOrganizationById(group.organizationId) || {
      id: 'preview-org',
      name: 'Preview Requesting School',
      type: 'REQUESTING_SCHOOL',
      verificationStatus: 'VERIFIED',
      address: 'Jhansi',
      district: 'Jhansi',
      state: 'Uttar Pradesh',
      pincode: '284001',
      phone: '9876543210',
      email: 'preview@betwaschool.org',
      trustScore: 85,
      isActive: true,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const sponsor = this.db.findUserById(group.sponsorUserId) || {
      id: 'preview-sponsor',
      name: 'Teacher Sponsor',
      phone: '9000000005',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return evaluateRules({
      request: {
        date,
        startTime,
        endTime,
        headcount: headcount || group.headcount,
        equipmentRequested: equipmentRequested || [],
      },
      lab,
      rules,
      group,
      sponsor,
      organization: org,
      orgMonthlyBookingCount: 1,
    })
  }
}
