// ============================================================
// LabShare – Shared Constants
// ============================================================

export const APP_NAME = 'LabShare India'
export const APP_NAME_HI = 'लैबशेयर भारत'
export const APP_TAGLINE = 'National Rural & Community School Lab Sharing Network'
export const APP_TAGLINE_HI = 'राष्ट्रीय ग्रामीण एवं सामुदायिक विद्यालय प्रयोगशाला नेटवर्क'

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

// Major Indian Cities & Regional Hubs for Pan-India Discovery
export interface IndianCity {
  name: string
  state: string
  lat: number
  lng: number
  pincode: string
  displayName: string
  displayNameHi: string
}

export const MAJOR_INDIAN_CITIES: IndianCity[] = [
  {
    name: 'Delhi NCR',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.209,
    pincode: '110001',
    displayName: 'Delhi NCR / नई दिल्ली',
    displayNameHi: 'दिल्ली एनसीआर',
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    pincode: '400001',
    displayName: 'Mumbai / मुंबई',
    displayNameHi: 'मुंबई',
  },
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    pincode: '560001',
    displayName: 'Bengaluru / बेंगलुरु',
    displayNameHi: 'बेंगलुरु',
  },
  {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    pincode: '226001',
    displayName: 'Lucknow / लखनऊ',
    displayNameHi: 'लखनऊ',
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    pincode: '302001',
    displayName: 'Jaipur / जयपुर',
    displayNameHi: 'जयपुर',
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.385,
    lng: 78.4867,
    pincode: '500001',
    displayName: 'Hyderabad / हैदराबाद',
    displayNameHi: 'हैदराबाद',
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    pincode: '411001',
    displayName: 'Pune / पुणे',
    displayNameHi: 'पुणे',
  },
  {
    name: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    pincode: '700001',
    displayName: 'Kolkata / कोलकाता',
    displayNameHi: 'कोलकाता',
  },
  {
    name: 'Patna',
    state: 'Bihar',
    lat: 25.5941,
    lng: 85.1376,
    pincode: '800001',
    displayName: 'Patna / पटना',
    displayNameHi: 'पटना',
  },
  {
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2599,
    lng: 77.4126,
    pincode: '462001',
    displayName: 'Bhopal / भोपाल',
    displayNameHi: 'भोपाल',
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    pincode: '380001',
    displayName: 'Ahmedabad / अहमदाबाद',
    displayNameHi: 'अहमदाबाद',
  },
  {
    name: 'Chandigarh',
    state: 'Punjab',
    lat: 30.7333,
    lng: 76.7794,
    pincode: '160017',
    displayName: 'Chandigarh / चंडीगढ़',
    displayNameHi: 'चंडीगढ़',
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    pincode: '600001',
    displayName: 'Chennai / चेन्नई',
    displayNameHi: 'चेन्नई',
  },
  {
    name: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    pincode: '452001',
    displayName: 'Indore / इंदौर',
    displayNameHi: 'इंदौर',
  },
  {
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    pincode: '221001',
    displayName: 'Varanasi / वाराणसी',
    displayNameHi: 'वाराणसी',
  },
  {
    name: 'Kanpur',
    state: 'Uttar Pradesh',
    lat: 26.4499,
    lng: 80.3319,
    pincode: '208001',
    displayName: 'Kanpur / कानपुर',
    displayNameHi: 'कानपुर',
  },
  {
    name: 'Dehradun',
    state: 'Uttarakhand',
    lat: 30.3165,
    lng: 78.0322,
    pincode: '248001',
    displayName: 'Dehradun / देहरादून',
    displayNameHi: 'देहरादून',
  },
  {
    name: 'Ranchi',
    state: 'Jharkhand',
    lat: 23.3441,
    lng: 85.3096,
    pincode: '834001',
    displayName: 'Ranchi / रांची',
    displayNameHi: 'रांची',
  },
  {
    name: 'Bhubaneswar',
    state: 'Odisha',
    lat: 20.2961,
    lng: 85.8245,
    pincode: '751001',
    displayName: 'Bhubaneswar / भुवनेश्वर',
    displayNameHi: 'भुवनेश्वर',
  },
  {
    name: 'Guwahati',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    pincode: '781001',
    displayName: 'Guwahati / गुवाहाटी',
    displayNameHi: 'गुवाहाटी',
  },
  {
    name: 'Kochi',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    pincode: '682001',
    displayName: 'Kochi / कोच्चि',
    displayNameHi: 'कोच्चि',
  },
  {
    name: 'Jhansi',
    state: 'Uttar Pradesh',
    lat: 25.4484,
    lng: 78.5685,
    pincode: '284001',
    displayName: 'Jhansi / झांसी',
    displayNameHi: 'झांसी',
  },
]

// Indian states list
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
]

export * from './seed-data.js'
