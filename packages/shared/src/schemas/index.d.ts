import { z } from 'zod';
export declare const sendOtpSchema: z.ZodObject<{
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
}, {
    phone: string;
}>;
export declare const verifyOtpSchema: z.ZodObject<{
    phone: z.ZodString;
    otp: z.ZodString;
    deviceFingerprint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    otp: string;
    deviceFingerprint?: string | undefined;
}, {
    phone: string;
    otp: string;
    deviceFingerprint?: string | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const orgTypeEnum: z.ZodEnum<["OWNER_SCHOOL", "REQUESTING_SCHOOL", "COACHING", "NGO"]>;
export declare const registerOrgSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["OWNER_SCHOOL", "REQUESTING_SCHOOL", "COACHING", "NGO"]>;
    udiseCode: z.ZodOptional<z.ZodString>;
    registrationNumber: z.ZodOptional<z.ZodString>;
    address: z.ZodString;
    district: z.ZodString;
    state: z.ZodString;
    pincode: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    type: "OWNER_SCHOOL" | "REQUESTING_SCHOOL" | "COACHING" | "NGO";
    name: string;
    address: string;
    district: string;
    state: string;
    pincode: string;
    udiseCode?: string | undefined;
    registrationNumber?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
}, {
    phone: string;
    type: "OWNER_SCHOOL" | "REQUESTING_SCHOOL" | "COACHING" | "NGO";
    name: string;
    address: string;
    district: string;
    state: string;
    pincode: string;
    udiseCode?: string | undefined;
    registrationNumber?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
}>;
export declare const verifyOrgSchema: z.ZodObject<{
    status: z.ZodEnum<["VERIFIED", "REJECTED"]>;
    reason: z.ZodOptional<z.ZodString>;
    adminNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "VERIFIED" | "REJECTED";
    reason?: string | undefined;
    adminNote?: string | undefined;
}, {
    status: "VERIFIED" | "REJECTED";
    reason?: string | undefined;
    adminNote?: string | undefined;
}>;
export declare const labTypeEnum: z.ZodEnum<["SCIENCE_LAB", "COMPUTER_LAB", "PROJECTOR_ROOM", "LIBRARY", "WORKSHOP"]>;
export declare const createLabSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["SCIENCE_LAB", "COMPUTER_LAB", "PROJECTOR_ROOM", "LIBRARY", "WORKSHOP"]>;
    description: z.ZodOptional<z.ZodString>;
    capacity: z.ZodNumber;
    areasqft: z.ZodOptional<z.ZodNumber>;
    floor: z.ZodOptional<z.ZodNumber>;
    buildingName: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    isAccessible: z.ZodDefault<z.ZodBoolean>;
    accessibilityNotes: z.ZodOptional<z.ZodString>;
    safetyNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SCIENCE_LAB" | "COMPUTER_LAB" | "PROJECTOR_ROOM" | "LIBRARY" | "WORKSHOP";
    name: string;
    capacity: number;
    isAccessible: boolean;
    lat?: number | undefined;
    lng?: number | undefined;
    description?: string | undefined;
    areasqft?: number | undefined;
    floor?: number | undefined;
    buildingName?: string | undefined;
    accessibilityNotes?: string | undefined;
    safetyNotes?: string | undefined;
}, {
    type: "SCIENCE_LAB" | "COMPUTER_LAB" | "PROJECTOR_ROOM" | "LIBRARY" | "WORKSHOP";
    name: string;
    capacity: number;
    lat?: number | undefined;
    lng?: number | undefined;
    description?: string | undefined;
    areasqft?: number | undefined;
    floor?: number | undefined;
    buildingName?: string | undefined;
    isAccessible?: boolean | undefined;
    accessibilityNotes?: string | undefined;
    safetyNotes?: string | undefined;
}>;
export declare const updateLabSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["SCIENCE_LAB", "COMPUTER_LAB", "PROJECTOR_ROOM", "LIBRARY", "WORKSHOP"]>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    capacity: z.ZodOptional<z.ZodNumber>;
    areasqft: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    floor: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    buildingName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lat: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    lng: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isAccessible: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    accessibilityNotes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    safetyNotes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: "SCIENCE_LAB" | "COMPUTER_LAB" | "PROJECTOR_ROOM" | "LIBRARY" | "WORKSHOP" | undefined;
    name?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    description?: string | undefined;
    capacity?: number | undefined;
    areasqft?: number | undefined;
    floor?: number | undefined;
    buildingName?: string | undefined;
    isAccessible?: boolean | undefined;
    accessibilityNotes?: string | undefined;
    safetyNotes?: string | undefined;
}, {
    type?: "SCIENCE_LAB" | "COMPUTER_LAB" | "PROJECTOR_ROOM" | "LIBRARY" | "WORKSHOP" | undefined;
    name?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    description?: string | undefined;
    capacity?: number | undefined;
    areasqft?: number | undefined;
    floor?: number | undefined;
    buildingName?: string | undefined;
    isAccessible?: boolean | undefined;
    accessibilityNotes?: string | undefined;
    safetyNotes?: string | undefined;
}>;
export declare const labSearchSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["SCIENCE_LAB", "COMPUTER_LAB", "PROJECTOR_ROOM", "LIBRARY", "WORKSHOP"]>>;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    minCapacity: z.ZodOptional<z.ZodNumber>;
    maxCapacity: z.ZodOptional<z.ZodNumber>;
    date: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    radiusKm: z.ZodOptional<z.ZodNumber>;
    equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["distance", "trust", "rating", "name"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "name" | "distance" | "trust" | "rating";
    type?: "SCIENCE_LAB" | "COMPUTER_LAB" | "PROJECTOR_ROOM" | "LIBRARY" | "WORKSHOP" | undefined;
    district?: string | undefined;
    state?: string | undefined;
    date?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    minCapacity?: number | undefined;
    maxCapacity?: number | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    radiusKm?: number | undefined;
    equipment?: string[] | undefined;
}, {
    type?: "SCIENCE_LAB" | "COMPUTER_LAB" | "PROJECTOR_ROOM" | "LIBRARY" | "WORKSHOP" | undefined;
    district?: string | undefined;
    state?: string | undefined;
    date?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    minCapacity?: number | undefined;
    maxCapacity?: number | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    radiusKm?: number | undefined;
    equipment?: string[] | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "name" | "distance" | "trust" | "rating" | undefined;
}>;
export declare const dayOfWeekEnum: z.ZodEnum<["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]>;
export declare const createLabRulesSchema: z.ZodObject<{
    allowedDays: z.ZodArray<z.ZodEnum<["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]>, "many">;
    allowedStartTime: z.ZodString;
    allowedEndTime: z.ZodString;
    holidayOnly: z.ZodDefault<z.ZodBoolean>;
    minDurationMinutes: z.ZodDefault<z.ZodNumber>;
    maxDurationMinutes: z.ZodDefault<z.ZodNumber>;
    advanceNoticeDays: z.ZodDefault<z.ZodNumber>;
    maxAdvanceBookingDays: z.ZodDefault<z.ZodNumber>;
    maxGroupSize: z.ZodNumber;
    minClassStandard: z.ZodOptional<z.ZodNumber>;
    minAgeYears: z.ZodOptional<z.ZodNumber>;
    supervisionRatioAdults: z.ZodDefault<z.ZodNumber>;
    supervisionRatioStudents: z.ZodDefault<z.ZodNumber>;
    requiresVerifiedSponsor: z.ZodDefault<z.ZodBoolean>;
    requiresParentConsent: z.ZodDefault<z.ZodBoolean>;
    restrictedEquipmentIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    maxBookingsPerOrgPerMonth: z.ZodDefault<z.ZodNumber>;
    autoApproveForTrustedScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    allowedDays: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[];
    allowedStartTime: string;
    allowedEndTime: string;
    holidayOnly: boolean;
    minDurationMinutes: number;
    maxDurationMinutes: number;
    advanceNoticeDays: number;
    maxAdvanceBookingDays: number;
    maxGroupSize: number;
    supervisionRatioAdults: number;
    supervisionRatioStudents: number;
    requiresVerifiedSponsor: boolean;
    requiresParentConsent: boolean;
    restrictedEquipmentIds: string[];
    maxBookingsPerOrgPerMonth: number;
    minClassStandard?: number | undefined;
    minAgeYears?: number | undefined;
    autoApproveForTrustedScore?: number | undefined;
}, {
    allowedDays: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[];
    allowedStartTime: string;
    allowedEndTime: string;
    maxGroupSize: number;
    holidayOnly?: boolean | undefined;
    minDurationMinutes?: number | undefined;
    maxDurationMinutes?: number | undefined;
    advanceNoticeDays?: number | undefined;
    maxAdvanceBookingDays?: number | undefined;
    minClassStandard?: number | undefined;
    minAgeYears?: number | undefined;
    supervisionRatioAdults?: number | undefined;
    supervisionRatioStudents?: number | undefined;
    requiresVerifiedSponsor?: boolean | undefined;
    requiresParentConsent?: boolean | undefined;
    restrictedEquipmentIds?: string[] | undefined;
    maxBookingsPerOrgPerMonth?: number | undefined;
    autoApproveForTrustedScore?: number | undefined;
}>;
export declare const createStudentGroupSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    headcount: z.ZodNumber;
    classRangeMin: z.ZodNumber;
    classRangeMax: z.ZodNumber;
    ageRangeMin: z.ZodOptional<z.ZodNumber>;
    ageRangeMax: z.ZodOptional<z.ZodNumber>;
    emergencyContactName: z.ZodString;
    emergencyContactPhone: z.ZodString;
    emergencyContactRelation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    headcount: number;
    classRangeMin: number;
    classRangeMax: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    description?: string | undefined;
    ageRangeMin?: number | undefined;
    ageRangeMax?: number | undefined;
}, {
    name: string;
    headcount: number;
    classRangeMin: number;
    classRangeMax: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    description?: string | undefined;
    ageRangeMin?: number | undefined;
    ageRangeMax?: number | undefined;
}>, {
    name: string;
    headcount: number;
    classRangeMin: number;
    classRangeMax: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    description?: string | undefined;
    ageRangeMin?: number | undefined;
    ageRangeMax?: number | undefined;
}, {
    name: string;
    headcount: number;
    classRangeMin: number;
    classRangeMax: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    description?: string | undefined;
    ageRangeMin?: number | undefined;
    ageRangeMax?: number | undefined;
}>;
export declare const createBookingSchema: z.ZodObject<{
    labId: z.ZodString;
    studentGroupId: z.ZodString;
    date: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    headcount: z.ZodNumber;
    purposeDescription: z.ZodString;
    equipmentRequested: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    specialRequirements: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    startTime: string;
    endTime: string;
    headcount: number;
    labId: string;
    studentGroupId: string;
    purposeDescription: string;
    equipmentRequested: string[];
    specialRequirements?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    date: string;
    startTime: string;
    endTime: string;
    headcount: number;
    labId: string;
    studentGroupId: string;
    purposeDescription: string;
    equipmentRequested?: string[] | undefined;
    specialRequirements?: string | undefined;
    idempotencyKey?: string | undefined;
}>;
export declare const sponsorVouchSchema: z.ZodObject<{
    bookingId: z.ZodString;
    declarationText: z.ZodString;
    consentChecklist: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        labelHi: z.ZodString;
        checked: z.ZodBoolean;
        required: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        key: string;
        label: string;
        labelHi: string;
        checked: boolean;
        required: boolean;
    }, {
        key: string;
        label: string;
        labelHi: string;
        checked: boolean;
        required: boolean;
    }>, "many">;
    parentConsentObtained: z.ZodBoolean;
    supervisingAdultName: z.ZodString;
    supervisingAdultPhone: z.ZodString;
    supervisingAdultRelation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    declarationText: string;
    consentChecklist: {
        key: string;
        label: string;
        labelHi: string;
        checked: boolean;
        required: boolean;
    }[];
    parentConsentObtained: boolean;
    supervisingAdultName: string;
    supervisingAdultPhone: string;
    supervisingAdultRelation: string;
}, {
    bookingId: string;
    declarationText: string;
    consentChecklist: {
        key: string;
        label: string;
        labelHi: string;
        checked: boolean;
        required: boolean;
    }[];
    parentConsentObtained: boolean;
    supervisingAdultName: string;
    supervisingAdultPhone: string;
    supervisingAdultRelation: string;
}>;
export declare const bookingActionSchema: z.ZodObject<{
    action: z.ZodEnum<["APPROVE", "REJECT", "REQUEST_CHANGES", "CANCEL"]>;
    note: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    version: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "CANCEL";
    version: number;
    reason?: string | undefined;
    note?: string | undefined;
}, {
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "CANCEL";
    version: number;
    reason?: string | undefined;
    note?: string | undefined;
}>;
export declare const checkInSchema: z.ZodObject<{
    bookingId: z.ZodString;
    method: z.ZodEnum<["OTP", "QR", "MANUAL"]>;
    code: z.ZodOptional<z.ZodString>;
    actualHeadcount: z.ZodNumber;
    supervisingAdultName: z.ZodString;
    supervisingAdultPhone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    supervisingAdultName: string;
    supervisingAdultPhone: string;
    method: "OTP" | "QR" | "MANUAL";
    actualHeadcount: number;
    code?: string | undefined;
}, {
    bookingId: string;
    supervisingAdultName: string;
    supervisingAdultPhone: string;
    method: "OTP" | "QR" | "MANUAL";
    actualHeadcount: number;
    code?: string | undefined;
}>;
export declare const checkOutSchema: z.ZodObject<{
    bookingId: z.ZodString;
    damageFlagged: z.ZodBoolean;
    damageNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    damageFlagged: boolean;
    damageNotes?: string | undefined;
}, {
    bookingId: string;
    damageFlagged: boolean;
    damageNotes?: string | undefined;
}>;
export declare const createIncidentSchema: z.ZodObject<{
    bookingId: z.ZodString;
    severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    title: z.ZodString;
    description: z.ZodString;
    evidenceFileIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    bookingId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    title: string;
    evidenceFileIds: string[];
}, {
    description: string;
    bookingId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    title: string;
    evidenceFileIds?: string[] | undefined;
}>;
export declare const resolveIncidentSchema: z.ZodObject<{
    resolution: z.ZodEnum<["WARN", "SUSPEND", "PENALTY", "DISMISS"]>;
    adminNote: z.ZodString;
    suspendUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    adminNote: string;
    resolution: "WARN" | "SUSPEND" | "PENALTY" | "DISMISS";
    suspendUntil?: string | undefined;
}, {
    adminNote: string;
    resolution: "WARN" | "SUSPEND" | "PENALTY" | "DISMISS";
    suspendUntil?: string | undefined;
}>;
export declare const createDisputeSchema: z.ZodObject<{
    bookingId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    bookingId: string;
    title: string;
}, {
    description: string;
    bookingId: string;
    title: string;
}>;
export declare const resolveDisputeSchema: z.ZodObject<{
    resolution: z.ZodString;
    adminNote: z.ZodString;
}, "strip", z.ZodTypeAny, {
    adminNote: string;
    resolution: string;
}, {
    adminNote: string;
    resolution: string;
}>;
export declare const createReviewSchema: z.ZodObject<{
    bookingId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    bookingId: string;
    isPublic: boolean;
    comment?: string | undefined;
}, {
    rating: number;
    bookingId: string;
    comment?: string | undefined;
    isPublic?: boolean | undefined;
}>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterOrgInput = z.infer<typeof registerOrgSchema>;
export type CreateLabInput = z.infer<typeof createLabSchema>;
export type UpdateLabInput = z.infer<typeof updateLabSchema>;
export type LabSearchInput = z.infer<typeof labSearchSchema>;
export type CreateLabRulesInput = z.infer<typeof createLabRulesSchema>;
export type CreateStudentGroupInput = z.infer<typeof createStudentGroupSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type SponsorVouchInput = z.infer<typeof sponsorVouchSchema>;
export type BookingActionInput = z.infer<typeof bookingActionSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
//# sourceMappingURL=index.d.ts.map