// ============================================================
// LabShare – Bookings Workflow Service
// State machine transitions, double-booking prevention,
// Idempotency-Key support, versioning, sponsor vouching.
// ============================================================

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  Booking,
  BookingActionInput,
  BookingStatus,
  canTransition,
  CreateBookingInput,
  evaluateRules,
  SponsorVouchInput,
  UserRole,
} from '@labshare/shared'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@Injectable()
export class BookingsService {
  constructor(private readonly db: InMemoryDbService) {}

  /**
   * Submit new booking request (Sponsor Journey)
   */
  async createBooking(
    input: CreateBookingInput,
    userId: string,
    orgId: string,
    idempotencyKey?: string
  ): Promise<Booking> {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const cached = this.db.idempotencyStore.get(idempotencyKey)
      if (cached && cached.expiresAt > Date.now()) {
        return cached.responseBody
      }
    }

    // 2. Fetch Entities
    const lab = this.db.findLabById(input.labId)
    if (!lab) throw new NotFoundException('Lab not found.')

    const group = this.db.studentGroups.find((g) => g.id === input.studentGroupId)
    if (!group) throw new NotFoundException('Student group not found.')

    const rules = lab.currentRules || this.db.labRules.find((r) => r.labId === lab.id)
    if (!rules) throw new BadRequestException('Lab has no active rules.')

    const sponsor = this.db.findUserById(userId)
    const org = this.db.findOrganizationById(orgId)
    if (!org) throw new BadRequestException('Organization not found.')

    // 3. Double-Booking Check (Transactional Guard)
    const startIso = `${input.date}T${input.startTime}:00.000Z`
    const endIso = `${input.date}T${input.endTime}:00.000Z`

    if (this.db.hasBookingConflict(lab.id, startIso, endIso)) {
      throw new ConflictException(
        'Slot conflict: This time window has already been confirmed for another student group.'
      )
    }

    // 4. Authoritative Rules Evaluation
    const rulesResult = evaluateRules({
      request: {
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        headcount: input.headcount,
        equipmentRequested: input.equipmentRequested,
      },
      lab,
      rules,
      group,
      sponsor: sponsor!,
      organization: org,
      orgMonthlyBookingCount: 1,
    })

    if (rulesResult.autoReject) {
      throw new BadRequestException(
        `Booking violated mandatory safety rules: ${rulesResult.violations.map((v) => v.message).join('; ')}`
      )
    }

    // 5. Initial status
    const initialStatus: BookingStatus = rulesResult.autoApprove ? 'APPROVED' : 'PENDING_MANAGER'

    const booking: Booking = {
      id: randomUUID(),
      labId: lab.id,
      organizationId: orgId,
      sponsorUserId: userId,
      studentGroupId: group.id,
      rulesVersionId: rules.id,
      status: initialStatus,
      version: 1,
      startTime: startIso,
      endTime: endIso,
      date: input.date,
      headcount: input.headcount,
      purposeDescription: input.purposeDescription,
      equipmentRequested: input.equipmentRequested,
      specialRequirements: input.specialRequirements,
      rulesDecision: rulesResult.decision,
      checkInCode: Math.floor(100000 + Math.random() * 900000).toString(),
      idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.db.bookings.push(booking)

    // Notify Host School Manager
    const hostManagers = this.db.memberships.filter(
      (m) => m.organizationId === lab.organizationId && m.role === 'MANAGER'
    )
    for (const mgr of hostManagers) {
      this.db.notifications.push({
        id: randomUUID(),
        userId: mgr.userId,
        type: 'BOOKING_SUBMITTED',
        title: 'New Booking Request',
        titleHi: 'नया बुकिंग अनुरोध',
        body: `${org.name} requested ${lab.name} for ${input.date}.`,
        bodyHi: `${org.name} ने ${input.date} के लिए ${lab.name} का अनुरोध किया है।`,
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    // Cache idempotency key
    if (idempotencyKey) {
      this.db.idempotencyStore.set(idempotencyKey, {
        responseCode: 201,
        responseBody: booking,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      })
    }

    return this.db.findBookingById(booking.id)!
  }

  /**
   * Execute State Machine Action (Approve, Reject, Request Changes, Cancel)
   */
  async executeAction(
    bookingId: string,
    actionInput: BookingActionInput,
    userId: string,
    userRole: UserRole,
    userOrgId: string
  ): Promise<Booking> {
    const booking = this.db.findBookingById(bookingId)
    if (!booking) throw new NotFoundException('Booking not found.')

    // Optimistic locking check
    if (actionInput.version !== booking.version) {
      throw new ConflictException(
        `Optimistic concurrency conflict: booking version ${booking.version} was updated by another user.`
      )
    }

    // Map action to target status
    let targetStatus: BookingStatus
    switch (actionInput.action) {
      case 'APPROVE':
        targetStatus = 'APPROVED'
        break
      case 'REJECT':
        targetStatus = 'REJECTED'
        break
      case 'REQUEST_CHANGES':
        targetStatus = 'CHANGES_REQUESTED'
        break
      case 'CANCEL':
        targetStatus = 'CANCELLED'
        break
      default:
        throw new BadRequestException('Invalid booking action.')
    }

    // Verify State Transition & IDOR Scoping
    const transitionCheck = canTransition({
      fromStatus: booking.status,
      toStatus: targetStatus,
      actorRole: userRole,
      actorUserId: userId,
      bookingSponsorId: booking.sponsorUserId,
      bookingOwnerOrgId: booking.lab?.organizationId || '',
      actorOrgId: userOrgId,
      reason: actionInput.reason || actionInput.note,
    })

    if (!transitionCheck.allowed) {
      throw new ForbiddenException(transitionCheck.error)
    }

    // If approving, verify slot conflict hasn't arisen concurrently
    if (targetStatus === 'APPROVED') {
      if (this.db.hasBookingConflict(booking.labId, booking.startTime, booking.endTime, booking.id)) {
        throw new ConflictException('Slot is no longer available due to a concurrent approval.')
      }
    }

    // Apply transition to database collection
    const rawBooking = this.db.bookings.find((b) => b.id === booking.id)
    if (rawBooking) {
      rawBooking.status = targetStatus
      rawBooking.version += 1
      rawBooking.updatedAt = new Date().toISOString()
      if (actionInput.action === 'APPROVE') {
        rawBooking.managerId = userId
        rawBooking.managerNote = actionInput.note
      } else if (actionInput.action === 'REJECT') {
        rawBooking.rejectionReason = actionInput.reason || actionInput.note
      }
    }

    // Record history
    this.db.statusHistory.push({
      id: randomUUID(),
      bookingId: booking.id,
      fromStatus: booking.status,
      toStatus: targetStatus,
      actorId: userId,
      actorRole: userRole,
      note: actionInput.note,
      createdAt: new Date().toISOString(),
    })

    // Notify visiting school sponsor
    this.db.notifications.push({
      id: randomUUID(),
      userId: booking.sponsorUserId,
      type: targetStatus === 'APPROVED' ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
      title: `Booking ${targetStatus}`,
      titleHi: `बुकिंग ${targetStatus === 'APPROVED' ? 'स्वीकृत' : 'अस्वीकृत'}`,
      body: `Your booking for ${booking.lab?.name} on ${booking.date} is now ${targetStatus}.`,
      bodyHi: `${booking.date} के लिए ${booking.lab?.name} की आपकी बुकिंग अब ${targetStatus} है।`,
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    return this.db.findBookingById(booking.id)!
  }

  /**
   * Submit Sponsor Digital Declaration (Vouching)
   */
  async submitVouch(input: SponsorVouchInput, userId: string, ip: string): Promise<any> {
    const booking = this.db.findBookingById(input.bookingId)
    if (!booking) throw new NotFoundException('Booking not found.')

    if (booking.sponsorUserId !== userId) {
      throw new ForbiddenException('Only the designated Teacher Sponsor may execute the digital declaration.')
    }

    const vouch = {
      id: randomUUID(),
      bookingId: input.bookingId,
      sponsorUserId: userId,
      studentGroupId: booking.studentGroupId,
      declarationText: input.declarationText,
      declarationTimestamp: new Date().toISOString(),
      declarationIp: ip,
      consentChecklist: input.consentChecklist,
      parentConsentObtained: input.parentConsentObtained,
      supervisingAdultName: input.supervisingAdultName,
      supervisingAdultPhone: input.supervisingAdultPhone,
      supervisingAdultRelation: input.supervisingAdultRelation,
    }

    this.db.sponsorVouches.push(vouch)
    return vouch
  }
}
