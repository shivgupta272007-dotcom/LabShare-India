import { describe, it } from 'node:test'
import assert from 'node:assert'
import { evaluateRules } from './rules-engine.js'
import { Lab, LabRules, Organization, StudentGroup, User } from '../types/index.js'

describe('Rules Engine (evaluateRules)', () => {
  const mockOrg: Organization = {
    id: 'org-req-1',
    name: 'Betwa Valley Vidyalaya',
    type: 'REQUESTING_SCHOOL',
    verificationStatus: 'VERIFIED',
    address: 'Near Fort, Jhansi',
    district: 'Jhansi',
    state: 'Uttar Pradesh',
    pincode: '284001',
    phone: '9876543210',
    email: 'info@betwa.edu.in',
    trustScore: 85,
    isActive: true,
    isSuspended: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockSponsor: User = {
    id: 'user-sponsor-1',
    name: 'Sunita Sharma',
    phone: '9000000005',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockGroup: StudentGroup = {
    id: 'group-1',
    organizationId: mockOrg.id,
    sponsorUserId: mockSponsor.id,
    name: 'Class 8 Science Explorers',
    headcount: 24,
    classRangeMin: 8,
    classRangeMax: 8,
    emergencyContactName: 'Sunita Sharma',
    emergencyContactPhone: '9000000005',
    emergencyContactRelation: 'Teacher',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockLab: Lab = {
    id: 'lab-science-1',
    organizationId: 'org-owner-1',
    name: 'C.V. Raman Physics & Chem Lab',
    type: 'SCIENCE_LAB',
    capacity: 35,
    isActive: true,
    isAccessible: true,
    trustScore: 92,
    totalBookings: 45,
    totalHoursShared: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockRules: LabRules = {
    id: 'rule-1',
    labId: mockLab.id,
    version: 1,
    isActive: true,
    allowedDays: ['MON', 'WED', 'FRI', 'SAT'],
    allowedStartTime: '15:00',
    allowedEndTime: '19:00',
    holidayOnly: false,
    minDurationMinutes: 60,
    maxDurationMinutes: 180,
    advanceNoticeDays: 2,
    maxAdvanceBookingDays: 30,
    maxGroupSize: 30,
    minClassStandard: 6,
    supervisionRatioAdults: 1,
    supervisionRatioStudents: 15,
    requiresVerifiedSponsor: true,
    requiresParentConsent: true,
    restrictedEquipmentIds: ['spec-microscope-1'],
    maxBookingsPerOrgPerMonth: 4,
    autoApproveForTrustedScore: 80,
    createdAt: new Date().toISOString(),
    createdBy: 'user-manager-1',
  }

  it('passes and triggers auto-approval for high-trust verified school within rules', () => {
    // 2026-11-02 is Monday
    const result = evaluateRules({
      request: {
        date: '2026-11-02',
        startTime: '15:30',
        endTime: '17:30',
        headcount: 24,
        equipmentRequested: [],
      },
      lab: mockLab,
      rules: mockRules,
      group: mockGroup,
      sponsor: mockSponsor,
      organization: mockOrg,
      orgMonthlyBookingCount: 1,
    })

    assert.strictEqual(result.decision, 'PASS')
    assert.strictEqual(result.autoApprove, true)
    assert.strictEqual(result.autoReject, false)
    assert.strictEqual(result.violations.length, 0)
  })

  it('hard-rejects if requesting organization is suspended', () => {
    const suspendedOrg: Organization = { ...mockOrg, isSuspended: true, suspensionReason: 'Policy violation' }
    const result = evaluateRules({
      request: {
        date: '2026-11-02',
        startTime: '15:30',
        endTime: '17:30',
        headcount: 20,
        equipmentRequested: [],
      },
      lab: mockLab,
      rules: mockRules,
      group: mockGroup,
      sponsor: mockSponsor,
      organization: suspendedOrg,
    })

    assert.strictEqual(result.decision, 'FAIL')
    assert.strictEqual(result.autoReject, true)
    assert(result.violations.some((v) => v.code === 'ORG_SUSPENDED'))
  })

  it('hard-rejects if student headcount exceeds safe lab capacity', () => {
    const result = evaluateRules({
      request: {
        date: '2026-11-02',
        startTime: '15:30',
        endTime: '17:30',
        headcount: 45, // Cap is 30
        equipmentRequested: [],
      },
      lab: mockLab,
      rules: mockRules,
      group: { ...mockGroup, headcount: 45 },
      sponsor: mockSponsor,
      organization: mockOrg,
    })

    assert.strictEqual(result.decision, 'FAIL')
    assert.strictEqual(result.autoReject, true)
    assert(result.violations.some((v) => v.code === 'CAPACITY_EXCEEDED'))
  })

  it('hard-rejects if requested slot falls on a non-operating day (e.g. Sunday)', () => {
    // 2026-11-01 is Sunday
    const result = evaluateRules({
      request: {
        date: '2026-11-01',
        startTime: '16:00',
        endTime: '17:00',
        headcount: 20,
        equipmentRequested: [],
      },
      lab: mockLab,
      rules: mockRules,
      group: mockGroup,
      sponsor: mockSponsor,
      organization: mockOrg,
    })

    assert.strictEqual(result.decision, 'FAIL')
    assert(result.violations.some((v) => v.code === 'DAY_NOT_ALLOWED'))
  })

  it('routes to manual review and issues warning if restricted equipment requested', () => {
    const result = evaluateRules({
      request: {
        date: '2026-11-02',
        startTime: '15:30',
        endTime: '17:30',
        headcount: 20,
        equipmentRequested: ['spec-microscope-1'],
      },
      lab: mockLab,
      rules: mockRules,
      group: mockGroup,
      sponsor: mockSponsor,
      organization: mockOrg,
    })

    assert.strictEqual(result.decision, 'NEEDS_MANUAL_REVIEW')
    assert.strictEqual(result.autoApprove, false)
    assert.strictEqual(result.autoReject, false)
    assert(result.warnings.some((w) => w.code === 'RESTRICTED_EQUIPMENT_REQUESTED'))
  })

  it('hard-rejects if student grade is below lab minimum safety standard', () => {
    const primaryGroup: StudentGroup = { ...mockGroup, classRangeMin: 4, classRangeMax: 5 }
    const result = evaluateRules({
      request: {
        date: '2026-11-02',
        startTime: '15:30',
        endTime: '17:30',
        headcount: 20,
        equipmentRequested: [],
      },
      lab: mockLab,
      rules: mockRules, // requires minClassStandard: 6
      group: primaryGroup,
      sponsor: mockSponsor,
      organization: mockOrg,
    })

    assert.strictEqual(result.decision, 'FAIL')
    assert(result.violations.some((v) => v.code === 'MIN_CLASS_NOT_MET'))
  })
})
