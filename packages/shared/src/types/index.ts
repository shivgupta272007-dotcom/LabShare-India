// ============================================================
// LabShare – Shared Types
// All domain types used by both frontend and backend
// ============================================================

// ──────────────────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────────────────

export type OrgType =
  | 'OWNER_SCHOOL'
  | 'REQUESTING_SCHOOL'
  | 'COACHING'
  | 'NGO'

export type VerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED'

export type UserRole =
  | 'OWNER_SCHOOL'  // Lab owner representative
  | 'MANAGER'       // Lab in-charge at a specific school
  | 'TEACHER_SPONSOR' // Vouches for booking, responsible adult
  | 'ADMIN'         // Platform admin

export type LabType =
  | 'SCIENCE_LAB'
  | 'COMPUTER_LAB'
  | 'PROJECTOR_ROOM'
  | 'LIBRARY'
  | 'WORKSHOP'

export type BookingStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AUTO_REJECTED'
  | 'PENDING_MANAGER'
  | 'APPROVED'
  | 'WAITLISTED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'EXPIRED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'INCIDENT_FLAGGED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'DISPUTED'
  | 'RESOLVED'

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'

export type NotificationType =
  | 'BOOKING_SUBMITTED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CHANGES_REQUESTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'CHECK_IN_DUE'
  | 'CHECKIN_CONFIRMED'
  | 'CHECKOUT_CONFIRMED'
  | 'INCIDENT_REPORTED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'ORG_VERIFIED'
  | 'ORG_REJECTED'
  | 'ORG_SUSPENDED'
  | 'TRUST_SCORE_CHANGED'
  | 'SYSTEM'

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'BOOKING_STATUS_CHANGE'
  | 'ORG_VERIFICATION'
  | 'INCIDENT_CREATED'
  | 'DISPUTE_CREATED'
  | 'DISPUTE_RESOLVED'
  | 'AUDIT_CHAIN_VERIFIED'
  | 'EXPORT'
  | 'SUSPENSION'

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

// ──────────────────────────────────────────────────────────
// Core Domain Types
// ──────────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  type: OrgType
  verificationStatus: VerificationStatus
  udiseCode?: string
  registrationNumber?: string
  address: string
  district: string
  state: string
  pincode: string
  lat?: number
  lng?: number
  phone: string
  email: string
  website?: string
  logoUrl?: string
  trustScore: number
  isActive: boolean
  isSuspended: boolean
  suspendedUntil?: string
  suspensionReason?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  phone: string
  email?: string
  name: string
  avatarUrl?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Membership {
  id: string
  userId: string
  organizationId: string
  role: UserRole
  isActive: boolean
  joinedAt: string
}

export interface Lab {
  id: string
  organizationId: string
  organization?: Organization
  name: string
  type: LabType
  description?: string
  capacity: number
  areasqft?: number
  floor?: number
  buildingName?: string
  lat?: number
  lng?: number
  isActive: boolean
  isAccessible: boolean
  accessibilityNotes?: string
  safetyNotes?: string
  equipmentSummary?: string
  photos?: LabPhoto[]
  equipment?: Equipment[]
  currentRules?: LabRules
  trustScore: number
  totalBookings: number
  totalHoursShared: number
  averageRating?: number
  createdAt: string
  updatedAt: string
}

export interface LabPhoto {
  id: string
  labId: string
  url: string
  caption?: string
  isPrimary: boolean
  order: number
}

export interface Equipment {
  id: string
  labId: string
  name: string
  description?: string
  quantity: number
  condition: 'GOOD' | 'FAIR' | 'POOR' | 'OUT_OF_SERVICE'
  isRestricted: boolean
  restrictionNotes?: string
}

export interface LabRules {
  id: string
  labId: string
  version: number
  isActive: boolean

  // Timing
  allowedDays: DayOfWeek[]
  allowedStartTime: string // HH:mm
  allowedEndTime: string   // HH:mm
  holidayOnly: boolean
  minDurationMinutes: number
  maxDurationMinutes: number
  advanceNoticeDays: number
  maxAdvanceBookingDays: number

  // Group constraints
  maxGroupSize: number
  minClassStandard?: number
  minAgeYears?: number
  supervisionRatioAdults: number  // 1 adult per N students
  supervisionRatioStudents: number

  // Access control
  requiresVerifiedSponsor: boolean
  requiresParentConsent: boolean
  restrictedEquipmentIds: string[]

  // Org limits
  maxBookingsPerOrgPerMonth: number
  autoApproveForTrustedScore?: number // trust score threshold

  createdAt: string
  createdBy: string
}

export interface BlackoutDate {
  id: string
  labId: string
  date: string
  reason?: string
  createdBy: string
}

export interface StudentGroup {
  id: string
  organizationId: string
  sponsorUserId: string
  name: string
  description?: string
  headcount: number
  classRangeMin: number  // e.g., 6 (for Class 6)
  classRangeMax: number  // e.g., 8 (for Class 8)
  ageRangeMin?: number
  ageRangeMax?: number
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SponsorVouch {
  id: string
  bookingId: string
  sponsorUserId: string
  studentGroupId: string
  declarationText: string
  declarationTimestamp: string
  declarationIp: string
  consentChecklist: ConsentItem[]
  parentConsentObtained: boolean
  supervisingAdultName: string
  supervisingAdultPhone: string
  supervisingAdultRelation: string
}

export interface ConsentItem {
  key: string
  label: string
  labelHi: string
  checked: boolean
  required: boolean
}

export interface Booking {
  id: string
  labId: string
  lab?: Lab
  organizationId: string
  organization?: Organization
  sponsorUserId: string
  sponsor?: User
  studentGroupId: string
  studentGroup?: StudentGroup
  rulesVersionId: string
  status: BookingStatus
  version: number

  // Timing
  startTime: string  // ISO UTC
  endTime: string    // ISO UTC
  date: string       // YYYY-MM-DD local

  // Group details (snapshot at booking time)
  headcount: number
  purposeDescription: string
  equipmentRequested: string[]
  specialRequirements?: string

  // Rules engine output
  rulesDecision?: RulesDecision

  // Check-in/out & Condition Reporting
  checkInCode?: string
  checkInAt?: string
  checkOutAt?: string
  actualHeadcount?: number
  supervisionAdultConfirmed?: boolean
  initialConditionNotes?: string
  finalConditionNotes?: string
  damageFlagged?: boolean
  damageNotes?: string
  waitlistPosition?: number

  // Manager
  managerId?: string
  managerNote?: string
  rejectionReason?: string

  // Idempotency
  idempotencyKey?: string

  statusHistory?: BookingStatusHistory[]
  vouch?: SponsorVouch
  review?: Review
  dispute?: Dispute
  incidents?: IncidentReport[]

  createdAt: string
  updatedAt: string
}

export interface BookingStatusHistory {
  id: string
  bookingId: string
  fromStatus?: BookingStatus
  toStatus: BookingStatus
  actorId: string
  actorRole: UserRole
  note?: string
  createdAt: string
}

export interface CheckInRecord {
  id: string
  bookingId: string
  checkInAt: string
  checkOutAt?: string
  checkedInByUserId: string
  checkInMethod: 'OTP' | 'QR' | 'MANUAL'
  actualHeadcount?: number
  supervisionAdultName?: string
  supervisionAdultPhone?: string
  damageFlagged: boolean
  damageNotes?: string
}

export interface IncidentReport {
  id: string
  bookingId: string
  reportedByUserId: string
  severity: IncidentSeverity
  title: string
  description: string
  evidenceFileIds: string[]
  adminNote?: string
  resolution?: 'WARN' | 'SUSPEND' | 'PENALTY' | 'DISMISS'
  resolvedByUserId?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Dispute {
  id: string
  bookingId: string
  raisedByUserId: string
  raisedByOrgId: string
  title: string
  description: string
  status: DisputeStatus
  adminNote?: string
  resolution?: string
  resolvedByUserId?: string
  resolvedAt?: string
  comments?: DisputeComment[]
  createdAt: string
  updatedAt: string
}

export interface DisputeComment {
  id: string
  disputeId: string
  authorId: string
  content: string
  createdAt: string
}

export interface Review {
  id: string
  bookingId: string
  reviewerUserId: string
  reviewerOrgId: string
  targetLabId: string
  rating: number  // 1-5
  comment?: string
  isPublic: boolean
  createdAt: string
}

export interface TrustScore {
  organizationId: string
  score: number  // 0-100
  completedBookings: number
  onTimeRate: number
  zeroIncidentRate: number
  averageRating: number
  disputesLost: number
  noShows: number
  accountAgeMonths: number
  lastComputedAt: string
  breakdown: TrustScoreBreakdown
}

export interface TrustScoreBreakdown {
  completedBookingsScore: number
  onTimeScore: number
  incidentScore: number
  ratingScore: number
  disputeScore: number
  noShowScore: number
  ageScore: number
  explanation: string
  explanationHi: string
}

export interface TrustScoreEvent {
  id: string
  organizationId: string
  eventType: string
  delta: number
  previousScore: number
  newScore: number
  reason: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  titleHi: string
  body: string
  bodyHi: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface AuditLog {
  id: string
  sequence: number
  actorId?: string
  actorRole?: UserRole
  action: AuditAction
  entityType: string
  entityId?: string
  organizationId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ip?: string
  userAgent?: string
  requestId?: string
  prevHash: string
  hash: string
  createdAt: string
}

// ──────────────────────────────────────────────────────────
// Rules Engine Types
// ──────────────────────────────────────────────────────────

export type RulesDecision = 'PASS' | 'FAIL' | 'NEEDS_MANUAL_REVIEW'

export interface RulesEvaluationResult {
  decision: RulesDecision
  violations: RulesViolation[]
  warnings: RulesWarning[]
  explanations: RulesExplanation[]
  autoApprove: boolean
  autoReject: boolean
}

export interface RulesViolation {
  code: string
  field?: string
  message: string
  messageHi: string
  severity: 'HARD' | 'SOFT'
}

export interface RulesWarning {
  code: string
  message: string
  messageHi: string
}

export interface RulesExplanation {
  rule: string
  status: 'PASS' | 'FAIL' | 'WARNING' | 'INFO'
  message: string
  messageHi: string
}

// ──────────────────────────────────────────────────────────
// Availability Types
// ──────────────────────────────────────────────────────────

export interface AvailabilitySlot {
  startTime: string  // ISO UTC
  endTime: string    // ISO UTC
  durationMinutes: number
  isAvailable: boolean
  reason?: string
}

export interface AvailabilityResponse {
  labId: string
  date: string
  slots: AvailabilitySlot[]
  blackoutReason?: string
  isBlackout: boolean
}

// ──────────────────────────────────────────────────────────
// Analytics Types
// ──────────────────────────────────────────────────────────

export interface ImpactMetrics {
  totalLabHoursShared: number
  totalStudentsBenefited: number
  totalOrgsServed: number
  totalBookingsCompleted: number
  idleCapacityUtilisationPercent: number
  estimatedValueINR: number
  districtCount: number
  updatedAt: string
}

export interface DistrictHeatmapData {
  district: string
  state: string
  lat: number
  lng: number
  bookingCount: number
  studentCount: number
  labHours: number
}

export interface LabUtilisationStats {
  labId: string
  labName: string
  totalSlotsAvailable: number
  totalSlotsBooked: number
  utilisationPercent: number
  totalHoursShared: number
  studentsBenefited: number
}

// ──────────────────────────────────────────────────────────
// API Pagination
// ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>[]
    requestId?: string
  }
}

// ──────────────────────────────────────────────────────────
// Auth Types
// ──────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface JwtPayload {
  sub: string        // userId
  phone: string
  orgId?: string
  role?: UserRole
  iat: number
  exp: number
  jti: string        // JWT ID for revocation
}

export interface MeResponse {
  user: User
  memberships: Array<Membership & { organization: Organization }>
  activeOrg?: Organization
  activeRole?: UserRole
}
