"use strict";
// ============================================================
// LabShare – Shared Constants
// ============================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDIAN_STATES = exports.BUNDELKHAND_DISTRICTS = exports.DEMO_OTP = exports.DEMO_ACCOUNTS = exports.DEMO_MODE_ENV = exports.CHECKIN_WINDOW_AFTER_MINUTES = exports.CHECKIN_WINDOW_BEFORE_MINUTES = exports.DEFAULT_SUPERVISION_STUDENTS = exports.DEFAULT_SUPERVISION_ADULTS = exports.LAB_HOUR_VALUE_INR = exports.ALLOWED_DOC_TYPES = exports.ALLOWED_IMAGE_TYPES = exports.MAX_DOC_SIZE_MB = exports.MAX_PHOTO_SIZE_MB = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.OTP_BRUTE_FORCE_LOCKOUT_MINUTES = exports.OTP_MAX_ATTEMPTS = exports.OTP_EXPIRY_MINUTES = exports.BOOKING_SLA_HOURS = exports.TRUST_SCORE_AUTO_APPROVE_THRESHOLD = exports.TRUST_SCORE_WEIGHTS = exports.BOOKING_TRANSITIONS = exports.IST_OFFSET_MINUTES = exports.APP_TAGLINE_HI = exports.APP_TAGLINE = exports.APP_NAME_HI = exports.APP_NAME = void 0;
exports.APP_NAME = 'LabShare';
exports.APP_NAME_HI = 'लैबशेयर';
exports.APP_TAGLINE = 'Connecting idle school labs with communities that need them';
exports.APP_TAGLINE_HI = 'खाली स्कूल लैब को जरूरतमंद समुदायों से जोड़ना';
// IST offset
exports.IST_OFFSET_MINUTES = 330; // UTC+5:30
// Booking state machine transitions (allowed: from → to[])
exports.BOOKING_TRANSITIONS = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['AUTO_REJECTED', 'PENDING_MANAGER'],
    PENDING_MANAGER: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'EXPIRED'],
    APPROVED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'DISPUTED'],
    CHECKED_IN: ['COMPLETED', 'INCIDENT_FLAGGED', 'DISPUTED'],
    COMPLETED: ['DISPUTED'],
    INCIDENT_FLAGGED: ['DISPUTED', 'RESOLVED'],
    DISPUTED: ['RESOLVED'],
    // Terminal states
    AUTO_REJECTED: [],
    REJECTED: [],
    EXPIRED: [],
    CANCELLED: [],
    NO_SHOW: [],
    CHANGES_REQUESTED: ['SUBMITTED', 'CANCELLED'],
    RESOLVED: [],
};
// Trust score weights (must sum to 100)
exports.TRUST_SCORE_WEIGHTS = {
    completedBookings: 25, // up to 25 pts, scales with volume
    onTimeRate: 20, // on-time check-in/out
    zeroIncidentRate: 20, // no incidents
    averageRating: 15, // 1-5 stars from lab owners
    noDisputesLost: 10, // disputes decided against org
    noNoShows: 5, // no-show rate
    accountAge: 5, // months active (max 5 pts)
};
exports.TRUST_SCORE_AUTO_APPROVE_THRESHOLD = 80;
// Booking SLA minutes – manager must act within this time
exports.BOOKING_SLA_HOURS = 48;
// OTP
exports.OTP_EXPIRY_MINUTES = 10;
exports.OTP_MAX_ATTEMPTS = 3;
exports.OTP_BRUTE_FORCE_LOCKOUT_MINUTES = 30;
// Pagination defaults
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
// File upload limits
exports.MAX_PHOTO_SIZE_MB = 5;
exports.MAX_DOC_SIZE_MB = 10;
exports.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
exports.ALLOWED_DOC_TYPES = ['application/pdf', ...exports.ALLOWED_IMAGE_TYPES];
// Value estimation (INR per lab hour)
exports.LAB_HOUR_VALUE_INR = {
    SCIENCE_LAB: 500,
    COMPUTER_LAB: 800,
    PROJECTOR_ROOM: 300,
    LIBRARY: 200,
    WORKSHOP: 600,
};
// Supervision ratio defaults
exports.DEFAULT_SUPERVISION_ADULTS = 1;
exports.DEFAULT_SUPERVISION_STUDENTS = 15;
// Check-in window (minutes before/after booking start)
exports.CHECKIN_WINDOW_BEFORE_MINUTES = 15;
exports.CHECKIN_WINDOW_AFTER_MINUTES = 30;
// Demo mode flag (set via env)
exports.DEMO_MODE_ENV = 'DEMO_MODE';
// Demo account phones (used in seed + shown on login page)
exports.DEMO_ACCOUNTS = [
    { phone: '9000000001', role: 'ADMIN', name: 'Admin User' },
    { phone: '9000000002', role: 'OWNER_SCHOOL', name: 'Navodaya Owner', org: 'Navodaya Vidyalaya Jhansi' },
    { phone: '9000000003', role: 'MANAGER', name: 'Lab Manager', org: 'Navodaya Vidyalaya Jhansi' },
    { phone: '9000000004', role: 'OWNER_SCHOOL', name: 'DPS Owner', org: 'Delhi Public School Jhansi' },
    { phone: '9000000005', role: 'TEACHER_SPONSOR', name: 'NGO Sponsor', org: 'Bundelkhand Shiksha Samiti' },
    { phone: '9000000006', role: 'TEACHER_SPONSOR', name: 'Coaching Sponsor', org: 'Asha Coaching Centre' },
];
exports.DEMO_OTP = '123456';
// Districts in Bundelkhand (for seed data)
exports.BUNDELKHAND_DISTRICTS = [
    'Jhansi', 'Lalitpur', 'Jalaun', 'Hamirpur', 'Mahoba', 'Banda', 'Chitrakoot'
];
// Indian states list (abbreviated)
exports.INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
];
__exportStar(require("./seed-data.js"), exports);
//# sourceMappingURL=index.js.map