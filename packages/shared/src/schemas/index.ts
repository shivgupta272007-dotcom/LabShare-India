import { z } from 'zod'

// ──────────────────────────────────────────────────────────
// Auth Schemas
// ──────────────────────────────────────────────────────────

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/),
  deviceFingerprint: z.string().optional(),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

// ──────────────────────────────────────────────────────────
// Organization Schemas
// ──────────────────────────────────────────────────────────

export const orgTypeEnum = z.enum([
  'OWNER_SCHOOL',
  'REQUESTING_SCHOOL',
  'COACHING',
  'NGO',
])

export const registerOrgSchema = z.object({
  name: z.string().min(3).max(200),
  type: orgTypeEnum,
  udiseCode: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: z.string().min(10).max(500),
  district: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
})

export const verifyOrgSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  reason: z.string().optional(),
  adminNote: z.string().optional(),
})

// ──────────────────────────────────────────────────────────
// Lab Schemas
// ──────────────────────────────────────────────────────────

export const labTypeEnum = z.enum([
  'SCIENCE_LAB',
  'COMPUTER_LAB',
  'PROJECTOR_ROOM',
  'LIBRARY',
  'WORKSHOP',
])

export const createLabSchema = z.object({
  name: z.string().min(3).max(200),
  type: labTypeEnum,
  description: z.string().max(2000).optional(),
  capacity: z.number().int().min(1).max(500),
  areasqft: z.number().positive().optional(),
  floor: z.number().int().min(-2).max(50).optional(),
  buildingName: z.string().max(100).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isAccessible: z.boolean().default(false),
  accessibilityNotes: z.string().max(500).optional(),
  safetyNotes: z.string().max(1000).optional(),
})

export const updateLabSchema = createLabSchema.partial()

export const labSearchSchema = z.object({
  type: labTypeEnum.optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  minCapacity: z.number().int().positive().optional(),
  maxCapacity: z.number().int().positive().optional(),
  date: z.string().date().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().positive().max(200).optional(),
  equipment: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['distance', 'trust', 'rating', 'name']).default('distance'),
})

// ──────────────────────────────────────────────────────────
// Lab Rules Schemas
// ──────────────────────────────────────────────────────────

export const dayOfWeekEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])

export const createLabRulesSchema = z.object({
  allowedDays: z.array(dayOfWeekEnum).min(1),
  allowedStartTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
  allowedEndTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
  holidayOnly: z.boolean().default(false),
  minDurationMinutes: z.number().int().min(30).default(60),
  maxDurationMinutes: z.number().int().max(480).default(240),
  advanceNoticeDays: z.number().int().min(0).max(30).default(3),
  maxAdvanceBookingDays: z.number().int().min(1).max(180).default(30),
  maxGroupSize: z.number().int().min(1).max(500),
  minClassStandard: z.number().int().min(1).max(12).optional(),
  minAgeYears: z.number().int().min(5).max(18).optional(),
  supervisionRatioAdults: z.number().int().min(1).default(1),
  supervisionRatioStudents: z.number().int().min(1).default(15),
  requiresVerifiedSponsor: z.boolean().default(true),
  requiresParentConsent: z.boolean().default(false),
  restrictedEquipmentIds: z.array(z.string()).default([]),
  maxBookingsPerOrgPerMonth: z.number().int().min(1).max(50).default(4),
  autoApproveForTrustedScore: z.number().min(0).max(100).optional(),
})

// ──────────────────────────────────────────────────────────
// Student Group Schemas
// ──────────────────────────────────────────────────────────

export const createStudentGroupSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  headcount: z.number().int().min(1).max(500),
  classRangeMin: z.number().int().min(1).max(12),
  classRangeMax: z.number().int().min(1).max(12),
  ageRangeMin: z.number().int().min(5).max(25).optional(),
  ageRangeMax: z.number().int().min(5).max(25).optional(),
  emergencyContactName: z.string().min(2).max(100),
  emergencyContactPhone: z.string().regex(/^[6-9]\d{9}$/),
  emergencyContactRelation: z.string().min(2).max(50),
}).refine(
  (d) => d.classRangeMin <= d.classRangeMax,
  { message: 'Min class must be ≤ max class', path: ['classRangeMin'] }
)

// ──────────────────────────────────────────────────────────
// Booking Schemas
// ──────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  labId: z.string().uuid(),
  studentGroupId: z.string().uuid(),
  date: z.string().date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  headcount: z.number().int().min(1),
  purposeDescription: z.string().min(10).max(1000),
  equipmentRequested: z.array(z.string()).default([]),
  specialRequirements: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid().optional(),
})

export const sponsorVouchSchema = z.object({
  bookingId: z.string().uuid(),
  declarationText: z.string().min(50),
  consentChecklist: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      labelHi: z.string(),
      checked: z.boolean(),
      required: z.boolean(),
    })
  ),
  parentConsentObtained: z.boolean(),
  supervisingAdultName: z.string().min(2).max(100),
  supervisingAdultPhone: z.string().regex(/^[6-9]\d{9}$/),
  supervisingAdultRelation: z.string().min(2).max(50),
})

export const bookingActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'CANCEL']),
  note: z.string().max(1000).optional(),
  reason: z.string().max(500).optional(),
  version: z.number().int(),
})

export const checkInSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(['OTP', 'QR', 'MANUAL']),
  code: z.string().optional(),
  actualHeadcount: z.number().int().min(1),
  supervisingAdultName: z.string().min(2),
  supervisingAdultPhone: z.string().regex(/^[6-9]\d{9}$/),
})

export const checkOutSchema = z.object({
  bookingId: z.string().uuid(),
  damageFlagged: z.boolean(),
  damageNotes: z.string().max(1000).optional(),
})

// ──────────────────────────────────────────────────────────
// Incident & Dispute Schemas
// ──────────────────────────────────────────────────────────

export const createIncidentSchema = z.object({
  bookingId: z.string().uuid(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(3000),
  evidenceFileIds: z.array(z.string().uuid()).default([]),
})

export const resolveIncidentSchema = z.object({
  resolution: z.enum(['WARN', 'SUSPEND', 'PENALTY', 'DISMISS']),
  adminNote: z.string().min(5).max(2000),
  suspendUntil: z.string().date().optional(),
})

export const createDisputeSchema = z.object({
  bookingId: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(3000),
})

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(5).max(2000),
  adminNote: z.string().min(5).max(2000),
})

// ──────────────────────────────────────────────────────────
// Review Schemas
// ──────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  isPublic: z.boolean().default(true),
})

// ──────────────────────────────────────────────────────────
// Type Exports (inferred from schemas)
// ──────────────────────────────────────────────────────────

export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type RegisterOrgInput = z.infer<typeof registerOrgSchema>
export type CreateLabInput = z.infer<typeof createLabSchema>
export type UpdateLabInput = z.infer<typeof updateLabSchema>
export type LabSearchInput = z.infer<typeof labSearchSchema>
export type CreateLabRulesInput = z.infer<typeof createLabRulesSchema>
export type CreateStudentGroupInput = z.infer<typeof createStudentGroupSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type SponsorVouchInput = z.infer<typeof sponsorVouchSchema>
export type BookingActionInput = z.infer<typeof bookingActionSchema>
export type CheckInInput = z.infer<typeof checkInSchema>
export type CheckOutInput = z.infer<typeof checkOutSchema>
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
