"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = exports.resolveDisputeSchema = exports.createDisputeSchema = exports.resolveIncidentSchema = exports.createIncidentSchema = exports.checkOutSchema = exports.checkInSchema = exports.bookingActionSchema = exports.sponsorVouchSchema = exports.createBookingSchema = exports.createStudentGroupSchema = exports.createLabRulesSchema = exports.dayOfWeekEnum = exports.labSearchSchema = exports.updateLabSchema = exports.createLabSchema = exports.labTypeEnum = exports.verifyOrgSchema = exports.registerOrgSchema = exports.orgTypeEnum = exports.refreshTokenSchema = exports.verifyOtpSchema = exports.sendOtpSchema = void 0;
const zod_1 = require("zod");
// ──────────────────────────────────────────────────────────
// Auth Schemas
// ──────────────────────────────────────────────────────────
exports.sendOtpSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});
exports.verifyOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/),
    deviceFingerprint: zod_1.z.string().optional(),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
// ──────────────────────────────────────────────────────────
// Organization Schemas
// ──────────────────────────────────────────────────────────
exports.orgTypeEnum = zod_1.z.enum([
    'OWNER_SCHOOL',
    'REQUESTING_SCHOOL',
    'COACHING',
    'NGO',
]);
exports.registerOrgSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(200),
    type: exports.orgTypeEnum,
    udiseCode: zod_1.z.string().optional(),
    registrationNumber: zod_1.z.string().optional(),
    address: zod_1.z.string().min(10).max(500),
    district: zod_1.z.string().min(2).max(100),
    state: zod_1.z.string().min(2).max(100),
    pincode: zod_1.z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    email: zod_1.z.string().email().optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    lat: zod_1.z.number().min(-90).max(90).optional(),
    lng: zod_1.z.number().min(-180).max(180).optional(),
});
exports.verifyOrgSchema = zod_1.z.object({
    status: zod_1.z.enum(['VERIFIED', 'REJECTED']),
    reason: zod_1.z.string().optional(),
    adminNote: zod_1.z.string().optional(),
});
// ──────────────────────────────────────────────────────────
// Lab Schemas
// ──────────────────────────────────────────────────────────
exports.labTypeEnum = zod_1.z.enum([
    'SCIENCE_LAB',
    'COMPUTER_LAB',
    'PROJECTOR_ROOM',
    'LIBRARY',
    'WORKSHOP',
]);
exports.createLabSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(200),
    type: exports.labTypeEnum,
    description: zod_1.z.string().max(2000).optional(),
    capacity: zod_1.z.number().int().min(1).max(500),
    areasqft: zod_1.z.number().positive().optional(),
    floor: zod_1.z.number().int().min(-2).max(50).optional(),
    buildingName: zod_1.z.string().max(100).optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
    isAccessible: zod_1.z.boolean().default(false),
    accessibilityNotes: zod_1.z.string().max(500).optional(),
    safetyNotes: zod_1.z.string().max(1000).optional(),
});
exports.updateLabSchema = exports.createLabSchema.partial();
exports.labSearchSchema = zod_1.z.object({
    type: exports.labTypeEnum.optional(),
    district: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    minCapacity: zod_1.z.number().int().positive().optional(),
    maxCapacity: zod_1.z.number().int().positive().optional(),
    date: zod_1.z.string().date().optional(),
    startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
    radiusKm: zod_1.z.number().positive().max(200).optional(),
    equipment: zod_1.z.array(zod_1.z.string()).optional(),
    page: zod_1.z.number().int().positive().default(1),
    pageSize: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['distance', 'trust', 'rating', 'name']).default('distance'),
});
// ──────────────────────────────────────────────────────────
// Lab Rules Schemas
// ──────────────────────────────────────────────────────────
exports.dayOfWeekEnum = zod_1.z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
exports.createLabRulesSchema = zod_1.z.object({
    allowedDays: zod_1.z.array(exports.dayOfWeekEnum).min(1),
    allowedStartTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
    allowedEndTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
    holidayOnly: zod_1.z.boolean().default(false),
    minDurationMinutes: zod_1.z.number().int().min(30).default(60),
    maxDurationMinutes: zod_1.z.number().int().max(480).default(240),
    advanceNoticeDays: zod_1.z.number().int().min(0).max(30).default(3),
    maxAdvanceBookingDays: zod_1.z.number().int().min(1).max(180).default(30),
    maxGroupSize: zod_1.z.number().int().min(1).max(500),
    minClassStandard: zod_1.z.number().int().min(1).max(12).optional(),
    minAgeYears: zod_1.z.number().int().min(5).max(18).optional(),
    supervisionRatioAdults: zod_1.z.number().int().min(1).default(1),
    supervisionRatioStudents: zod_1.z.number().int().min(1).default(15),
    requiresVerifiedSponsor: zod_1.z.boolean().default(true),
    requiresParentConsent: zod_1.z.boolean().default(false),
    restrictedEquipmentIds: zod_1.z.array(zod_1.z.string()).default([]),
    maxBookingsPerOrgPerMonth: zod_1.z.number().int().min(1).max(50).default(4),
    autoApproveForTrustedScore: zod_1.z.number().min(0).max(100).optional(),
});
// ──────────────────────────────────────────────────────────
// Student Group Schemas
// ──────────────────────────────────────────────────────────
exports.createStudentGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().max(1000).optional(),
    headcount: zod_1.z.number().int().min(1).max(500),
    classRangeMin: zod_1.z.number().int().min(1).max(12),
    classRangeMax: zod_1.z.number().int().min(1).max(12),
    ageRangeMin: zod_1.z.number().int().min(5).max(25).optional(),
    ageRangeMax: zod_1.z.number().int().min(5).max(25).optional(),
    emergencyContactName: zod_1.z.string().min(2).max(100),
    emergencyContactPhone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    emergencyContactRelation: zod_1.z.string().min(2).max(50),
}).refine((d) => d.classRangeMin <= d.classRangeMax, { message: 'Min class must be ≤ max class', path: ['classRangeMin'] });
// ──────────────────────────────────────────────────────────
// Booking Schemas
// ──────────────────────────────────────────────────────────
exports.createBookingSchema = zod_1.z.object({
    labId: zod_1.z.string().uuid(),
    studentGroupId: zod_1.z.string().uuid(),
    date: zod_1.z.string().date(),
    startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    headcount: zod_1.z.number().int().min(1),
    purposeDescription: zod_1.z.string().min(10).max(1000),
    equipmentRequested: zod_1.z.array(zod_1.z.string()).default([]),
    specialRequirements: zod_1.z.string().max(500).optional(),
    idempotencyKey: zod_1.z.string().uuid().optional(),
});
exports.sponsorVouchSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    declarationText: zod_1.z.string().min(50),
    consentChecklist: zod_1.z.array(zod_1.z.object({
        key: zod_1.z.string(),
        label: zod_1.z.string(),
        labelHi: zod_1.z.string(),
        checked: zod_1.z.boolean(),
        required: zod_1.z.boolean(),
    })),
    parentConsentObtained: zod_1.z.boolean(),
    supervisingAdultName: zod_1.z.string().min(2).max(100),
    supervisingAdultPhone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    supervisingAdultRelation: zod_1.z.string().min(2).max(50),
});
exports.bookingActionSchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'CANCEL']),
    note: zod_1.z.string().max(1000).optional(),
    reason: zod_1.z.string().max(500).optional(),
    version: zod_1.z.number().int(),
});
exports.checkInSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    method: zod_1.z.enum(['OTP', 'QR', 'MANUAL']),
    code: zod_1.z.string().optional(),
    actualHeadcount: zod_1.z.number().int().min(1),
    supervisingAdultName: zod_1.z.string().min(2),
    supervisingAdultPhone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
});
exports.checkOutSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    damageFlagged: zod_1.z.boolean(),
    damageNotes: zod_1.z.string().max(1000).optional(),
});
// ──────────────────────────────────────────────────────────
// Incident & Dispute Schemas
// ──────────────────────────────────────────────────────────
exports.createIncidentSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    title: zod_1.z.string().min(5).max(200),
    description: zod_1.z.string().min(10).max(3000),
    evidenceFileIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
});
exports.resolveIncidentSchema = zod_1.z.object({
    resolution: zod_1.z.enum(['WARN', 'SUSPEND', 'PENALTY', 'DISMISS']),
    adminNote: zod_1.z.string().min(5).max(2000),
    suspendUntil: zod_1.z.string().date().optional(),
});
exports.createDisputeSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(5).max(200),
    description: zod_1.z.string().min(10).max(3000),
});
exports.resolveDisputeSchema = zod_1.z.object({
    resolution: zod_1.z.string().min(5).max(2000),
    adminNote: zod_1.z.string().min(5).max(2000),
});
// ──────────────────────────────────────────────────────────
// Review Schemas
// ──────────────────────────────────────────────────────────
exports.createReviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
    isPublic: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=index.js.map