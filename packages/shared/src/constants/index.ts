// ============================================================
// LabShare – Shared Constants
// ============================================================

export const APP_NAME = 'LabShare'
export const APP_NAME_HI = 'लैबशेयर'
export const APP_TAGLINE = 'Connecting idle school labs with communities that need them'
export const APP_TAGLINE_HI = 'खाली स्कूल लैब को जरूरतमंद समुदायों से जोड़ना'

// IST offset
export const IST_OFFSET_MINUTES = 330 // UTC+5:30

import { BookingStatus } from '../types/index.js'

// Booking state machine transitions (allowed: from → to[])
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
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
}

// Trust score weights (must sum to 100)
export const TRUST_SCORE_WEIGHTS = {
  completedBookings: 25,   // up to 25 pts, scales with volume
  onTimeRate: 20,          // on-time check-in/out
  zeroIncidentRate: 20,    // no incidents
  averageRating: 15,       // 1-5 stars from lab owners
  noDisputesLost: 10,      // disputes decided against org
  noNoShows: 5,            // no-show rate
  accountAge: 5,           // months active (max 5 pts)
} as const

export const TRUST_SCORE_AUTO_APPROVE_THRESHOLD = 80

// Booking SLA minutes – manager must act within this time
export const BOOKING_SLA_HOURS = 48

// OTP
export const OTP_EXPIRY_MINUTES = 10
export const OTP_MAX_ATTEMPTS = 3
export const OTP_BRUTE_FORCE_LOCKOUT_MINUTES = 30

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File upload limits
export const MAX_PHOTO_SIZE_MB = 5
export const MAX_DOC_SIZE_MB = 10
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_DOC_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES]

// Value estimation (INR per lab hour)
export const LAB_HOUR_VALUE_INR: Record<string, number> = {
  SCIENCE_LAB: 500,
  COMPUTER_LAB: 800,
  PROJECTOR_ROOM: 300,
  LIBRARY: 200,
  WORKSHOP: 600,
}

// Supervision ratio defaults
export const DEFAULT_SUPERVISION_ADULTS = 1
export const DEFAULT_SUPERVISION_STUDENTS = 15

// Check-in window (minutes before/after booking start)
export const CHECKIN_WINDOW_BEFORE_MINUTES = 15
export const CHECKIN_WINDOW_AFTER_MINUTES = 30

// Demo mode flag (set via env)
export const DEMO_MODE_ENV = 'DEMO_MODE'

// Demo account phones (used in seed + shown on login page)
export const DEMO_ACCOUNTS = [
  { phone: '9000000001', role: 'ADMIN', name: 'Admin User', org: 'Platform Administration' },
  { phone: '9000000002', role: 'OWNER_SCHOOL', name: 'Navodaya Owner', org: 'Navodaya Vidyalaya Jhansi' },
  { phone: '9000000003', role: 'MANAGER', name: 'Lab Manager', org: 'Navodaya Vidyalaya Jhansi' },
  { phone: '9000000004', role: 'OWNER_SCHOOL', name: 'DPS Owner', org: 'Delhi Public School Jhansi' },
  { phone: '9000000005', role: 'TEACHER_SPONSOR', name: 'NGO Sponsor', org: 'Bundelkhand Shiksha Samiti' },
  { phone: '9000000006', role: 'TEACHER_SPONSOR', name: 'Coaching Sponsor', org: 'Asha Coaching Centre' },
] as const

export const DEMO_OTP = '123456'

// Districts in Bundelkhand (for seed data)
export const BUNDELKHAND_DISTRICTS = [
  'Jhansi', 'Lalitpur', 'Jalaun', 'Hamirpur', 'Mahoba', 'Banda', 'Chitrakoot'
]

// Indian states list (abbreviated)
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
]

export * from './seed-data.js'
