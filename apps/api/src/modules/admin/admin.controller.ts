// ============================================================
// LabShare – Admin, Audit Chain & Dispute Resolution Controller
// Hash-chain verification, institutional vetting, dispute tribunal
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
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { randomUUID } from 'node:crypto'
import { verifyAuditChain } from '@labshare/shared'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { RbacGuard } from '../../common/guards/rbac.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Admin & Compliance')
@Controller('admin')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly db: InMemoryDbService) {}

  // ──────────────────────────────────────────────────────────
  // 1. Audit Chain & Compliance
  // ──────────────────────────────────────────────────────────
  @Get('audit')
  @ApiOperation({ summary: 'Query immutable append-only audit trail' })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string
  ) {
    let logs = this.db.auditLogs
    if (action) logs = logs.filter((l) => l.action === action)
    if (entityType) logs = logs.filter((l) => l.entityType === entityType)

    return logs.sort((a, b) => Number(b.sequence) - Number(a.sequence))
  }

  @Get('audit/verify')
  @ApiOperation({
    summary: 'Cryptographically verify entire SHA-256 hash chain from genesis to head',
  })
  async verifyChain() {
    const result = verifyAuditChain(this.db.auditLogs)
    return {
      ...result,
      statusBadge: result.isValid ? 'VERIFIED_SECURE' : 'INTEGRITY_COMPROMISED',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('audit/export')
  @ApiOperation({ summary: 'Export audit logs as CSV or JSON for compliance inspectors' })
  @ApiQuery({ name: 'format', required: false, type: String })
  async exportAudit(@Query('format') format: string = 'json', @Res() res: Response) {
    const logs = this.db.auditLogs.sort((a, b) => Number(a.sequence) - Number(b.sequence))

    if (format === 'csv') {
      const headers = ['sequence', 'action', 'entityType', 'entityId', 'actorRole', 'ip', 'prevHash', 'hash', 'createdAt']
      const rows = logs.map((l) =>
        [l.sequence, l.action, l.entityType, l.entityId || '', l.actorRole || '', l.ip || '', l.prevHash, l.hash, l.createdAt].join(',')
      )
      const csv = [headers.join(','), ...rows].join('\n')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="labshare-audit-chain.csv"')
      return res.send(csv)
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename="labshare-audit-chain.json"')
    return res.json(logs)
  }

  // ──────────────────────────────────────────────────────────
  // 2. Institutional Vetting
  // ──────────────────────────────────────────────────────────
  @Get('organizations/pending')
  @ApiOperation({ summary: 'List institutions awaiting admin accreditation review' })
  async getPendingOrgs() {
    return this.db.organizations.filter(
      (o) => o.verificationStatus === 'PENDING' || o.verificationStatus === 'UNDER_REVIEW'
    )
  }

  @Post('organizations/:id/verify')
  @ApiOperation({ summary: 'Approve or reject institution verification with official reason' })
  async verifyOrg(
    @Param('id') orgId: string,
    @Body() body: { status: 'VERIFIED' | 'REJECTED'; reason?: string }
  ) {
    const org = this.db.findOrganizationById(orgId)
    if (!org) throw new NotFoundException('Organization not found.')

    org.verificationStatus = body.status
    org.updatedAt = new Date().toISOString()

    return {
      success: true,
      orgId,
      status: org.verificationStatus,
      message: `Organization is now ${org.verificationStatus}.`,
    }
  }

  @Post('organizations/:id/suspend')
  @ApiOperation({ summary: 'Suspend institution and immediately block new lab bookings' })
  async suspendOrg(
    @Param('id') orgId: string,
    @Body() body: { reason: string }
  ) {
    const org = this.db.findOrganizationById(orgId)
    if (!org) throw new NotFoundException('Organization not found.')

    org.isSuspended = true
    org.suspensionReason = body.reason || 'Administrative suspension'
    org.updatedAt = new Date().toISOString()

    return {
      success: true,
      message: `Organization ${org.name} has been suspended.`,
      org,
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. Dispute Resolution Tribunal
  // ──────────────────────────────────────────────────────────
  @Get('disputes')
  @ApiOperation({ summary: 'List all open and resolved disputes' })
  async listDisputes() {
    return this.db.disputes.map((d) => {
      const booking = this.db.findBookingById(d.bookingId)
      return {
        ...d,
        booking,
      }
    })
  }

  @Post('disputes/:id/resolve')
  @ApiOperation({ summary: 'Execute administrative resolution for a disputed booking' })
  async resolveDispute(
    @Param('id') disputeId: string,
    @Body() body: { resolution: string; adminNote?: string },
    @CurrentUser('userId') adminId: string
  ) {
    const dispute = this.db.disputes.find((d) => d.id === disputeId)
    if (!dispute) throw new NotFoundException('Dispute not found.')

    dispute.status = 'RESOLVED'
    dispute.resolution = body.resolution
    dispute.adminNote = body.adminNote
    dispute.resolvedByUserId = adminId
    dispute.resolvedAt = new Date().toISOString()
    dispute.updatedAt = new Date().toISOString()

    // Update booking status
    const booking = this.db.findBookingById(dispute.bookingId)
    if (booking) {
      booking.status = 'RESOLVED'
      booking.version += 1
    }

    return {
      success: true,
      message: 'Dispute has been officially resolved.',
      dispute,
    }
  }
}
