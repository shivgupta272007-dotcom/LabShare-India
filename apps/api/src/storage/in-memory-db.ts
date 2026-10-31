// ============================================================
// LabShare – In-Memory Database Adapter (Port & Adapter Pattern)
// Enables full functionality with zero database dependencies
// Preloaded with Bundelkhand demo schools, labs, bookings & audit log
// ============================================================

import { Injectable, Logger } from '@nestjs/common'
import {
  AuditLog,
  Booking,
  BookingStatus,
  BookingStatusHistory,
  Dispute,
  DisputeComment,
  Equipment,
  IncidentReport,
  Lab,
  LabRules,
  Membership,
  Notification,
  Organization,
  Review,
  SponsorVouch,
  StudentGroup,
  TrustScore,
  User,
  UserRole,
} from '@labshare/shared'
import {
  SEED_AUDIT_LOGS,
  SEED_BOOKINGS,
  SEED_DISPUTES,
  SEED_LAB_RULES,
  SEED_LABS,
  SEED_MEMBERSHIPS,
  SEED_ORGANIZATIONS,
  SEED_REVIEWS,
  SEED_STUDENT_GROUPS,
  SEED_USERS,
} from '@labshare/shared'
import { computeTrustScore } from '@labshare/shared'

@Injectable()
export class InMemoryDbService {
  private readonly logger = new Logger(InMemoryDbService.name)

  // Collections
  public organizations: Organization[] = []
  public users: User[] = []
  public memberships: Membership[] = []
  public labs: Lab[] = []
  public labRules: LabRules[] = []
  public studentGroups: StudentGroup[] = []
  public bookings: Booking[] = []
  public statusHistory: BookingStatusHistory[] = []
  public sponsorVouches: SponsorVouch[] = []
  public disputes: Dispute[] = []
  public disputeComments: DisputeComment[] = []
  public incidentReports: IncidentReport[] = []
  public reviews: Review[] = []
  public auditLogs: AuditLog[] = []
  public notifications: Notification[] = []

  // Auth / Rate-limit stores
  public otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>()
  public refreshTokens = new Map<string, { userId: string; expiresAt: Date; isRevoked: boolean }>()
  public idempotencyStore = new Map<string, { responseCode: number; responseBody: any; expiresAt: number }>()

  constructor() {
    this.resetToSeedData()
    this.logger.log('InMemoryDbService initialized with master Bundelkhand seed dataset.')
  }

  public resetToSeedData() {
    this.organizations = JSON.parse(JSON.stringify(SEED_ORGANIZATIONS))
    this.users = JSON.parse(JSON.stringify(SEED_USERS))
    this.memberships = JSON.parse(JSON.stringify(SEED_MEMBERSHIPS))
    this.labs = JSON.parse(JSON.stringify(SEED_LABS))
    this.labRules = JSON.parse(JSON.stringify(SEED_LAB_RULES))
    this.studentGroups = JSON.parse(JSON.stringify(SEED_STUDENT_GROUPS))
    this.bookings = JSON.parse(JSON.stringify(SEED_BOOKINGS))
    this.disputes = JSON.parse(JSON.stringify(SEED_DISPUTES))
    this.reviews = JSON.parse(JSON.stringify(SEED_REVIEWS))
    this.auditLogs = JSON.parse(JSON.stringify(SEED_AUDIT_LOGS))
    this.statusHistory = []
    this.incidentReports = []
    this.sponsorVouches = []
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'b0000000-0000-0000-0000-000000000003', // Navodaya Manager
        type: 'BOOKING_SUBMITTED',
        title: 'New Booking Request Received',
        titleHi: 'नया प्रयोगशाला बुकिंग अनुरोध प्राप्त हुआ',
        body: 'Bundelkhand Shiksha Samiti requested Class 8 Physics Lab on Nov 6.',
        bodyHi: 'बुंदेलखंड शिक्षा समिति ने 6 नवंबर को कक्षा 8 भौतिकी लैब का अनुरोध किया है।',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]
  }

  // ──────────────────────────────────────────────────────────
  // Users & Auth
  // ──────────────────────────────────────────────────────────
  findUserByPhone(phone: string): User | undefined {
    return this.users.find((u) => u.phone === phone && u.isActive)
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  findMembershipsByUserId(userId: string): Array<Membership & { organization: Organization }> {
    const mems = this.memberships.filter((m) => m.userId === userId && m.isActive)
    return mems
      .map((m) => {
        const org = this.organizations.find((o) => o.id === m.organizationId)
        if (!org) return null
        return { ...m, organization: org }
      })
      .filter(Boolean) as Array<Membership & { organization: Organization }>
  }

  // ──────────────────────────────────────────────────────────
  // Organizations
  // ──────────────────────────────────────────────────────────
  findOrganizationById(id: string): Organization | undefined {
    return this.organizations.find((o) => o.id === id)
  }

  // ──────────────────────────────────────────────────────────
  // Labs
  // ──────────────────────────────────────────────────────────
  findLabById(id: string): Lab | undefined {
    const lab = this.labs.find((l) => l.id === id)
    if (!lab) return undefined
    const org = this.findOrganizationById(lab.organizationId)
    const currentRules = this.labRules.find((r) => r.labId === lab.id && r.isActive)
    return {
      ...lab,
      organization: org,
      currentRules,
    }
  }

  findLabs(query: {
    type?: string
    district?: string
    minCapacity?: number
    lat?: number
    lng?: number
    radiusKm?: number
  }): Lab[] {
    return this.labs
      .filter((l) => l.isActive)
      .map((l) => this.findLabById(l.id)!)
      .filter((l) => {
        if (query.type && l.type !== query.type) return false
        if (query.minCapacity && l.capacity < query.minCapacity) return false
        if (query.district && l.organization?.district?.toLowerCase() !== query.district.toLowerCase()) return false
        return true
      })
  }

  // ──────────────────────────────────────────────────────────
  // Bookings
  // ──────────────────────────────────────────────────────────
  findBookingById(id: string): Booking | undefined {
    const booking = this.bookings.find((b) => b.id === id)
    if (!booking) return undefined
    const lab = this.findLabById(booking.labId)
    const org = this.findOrganizationById(booking.organizationId)
    const sponsor = this.findUserById(booking.sponsorUserId)
    const group = this.studentGroups.find((g) => g.id === booking.studentGroupId)
    const vouch = this.sponsorVouches.find((v) => v.bookingId === booking.id)
    const dispute = this.disputes.find((d) => d.bookingId === booking.id)
    const review = this.reviews.find((r) => r.bookingId === booking.id)

    return {
      ...booking,
      lab,
      organization: org,
      sponsor,
      studentGroup: group,
      vouch,
      dispute,
      review,
    }
  }

  findBookingsByOrg(orgId: string): Booking[] {
    return this.bookings
      .filter((b) => b.organizationId === orgId)
      .map((b) => this.findBookingById(b.id)!)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  findBookingsByHostOrg(hostOrgId: string): Booking[] {
    const labIds = this.labs.filter((l) => l.organizationId === hostOrgId).map((l) => l.id)
    return this.bookings
      .filter((b) => labIds.includes(b.labId))
      .map((b) => this.findBookingById(b.id)!)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Double-booking check: returns true if conflict exists
  hasBookingConflict(
    labId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): boolean {
    const s1 = new Date(startTime).getTime()
    const e1 = new Date(endTime).getTime()

    return this.bookings.some((b) => {
      if (b.id === excludeBookingId) return false
      if (b.labId !== labId) return false
      // Only confirmed/active states occupy the slot
      if (!['APPROVED', 'CHECKED_IN'].includes(b.status)) return false

      const s2 = new Date(b.startTime).getTime()
      const e2 = new Date(b.endTime).getTime()

      return Math.max(s1, s2) < Math.min(e1, e2)
    })
  }

  // ──────────────────────────────────────────────────────────
  // Trust Score Computation
  // ──────────────────────────────────────────────────────────
  getTrustScoreForOrg(orgId: string): TrustScore {
    const org = this.findOrganizationById(orgId)
    const orgBookings = this.bookings.filter((b) => b.organizationId === orgId)
    const completed = orgBookings.filter((b) => b.status === 'COMPLETED').length
    const noShows = orgBookings.filter((b) => b.status === 'NO_SHOW').length
    const disputesLost = this.disputes.filter(
      (d) => d.raisedByOrgId !== orgId && d.status === 'RESOLVED'
    ).length
    const orgReviews = this.reviews.filter((r) => r.reviewerOrgId !== orgId)
    const avgRating =
      orgReviews.length > 0
        ? orgReviews.reduce((sum, r) => sum + r.rating, 0) / orgReviews.length
        : 4.8

    return computeTrustScore({
      organizationId: orgId,
      completedBookings: completed,
      onTimeCheckIns: completed,
      totalCheckIns: completed + noShows,
      incidentCount: 0,
      averageRating: avgRating,
      ratingCount: orgReviews.length,
      disputesLost,
      noShows,
      accountAgeMonths: 8,
    })
  }
}
