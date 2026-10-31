import { describe, it } from 'node:test'
import assert from 'node:assert'
import { computeAvailability } from './availability-engine.js'
import { LabRules } from '../types/index.js'

describe('Availability Engine (computeAvailability)', () => {
  const mockRules: LabRules = {
    id: 'rule-avail-1',
    labId: 'lab-1',
    version: 1,
    isActive: true,
    allowedDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    allowedStartTime: '14:00',
    allowedEndTime: '18:00',
    holidayOnly: false,
    minDurationMinutes: 60,
    maxDurationMinutes: 120,
    advanceNoticeDays: 1,
    maxAdvanceBookingDays: 30,
    maxGroupSize: 30,
    supervisionRatioAdults: 1,
    supervisionRatioStudents: 15,
    requiresVerifiedSponsor: true,
    requiresParentConsent: false,
    restrictedEquipmentIds: [],
    maxBookingsPerOrgPerMonth: 4,
    createdAt: new Date().toISOString(),
    createdBy: 'mgr-1',
  }

  it('marks date as blackout if host school reserved it', () => {
    const res = computeAvailability({
      labId: 'lab-1',
      date: '2026-11-04',
      rules: mockRules,
      blackouts: [{ id: 'b1', labId: 'lab-1', date: '2026-11-04', reason: 'School Annual Function', createdBy: 'mgr-1' }],
      confirmedBookings: [],
    })

    assert.strictEqual(res.isBlackout, true)
    assert(res.blackoutReason?.includes('School Annual Function'))
    assert.strictEqual(res.slots.length, 0)
  })

  it('generates open 60-min slots across operating window', () => {
    // 2026-11-02 is Monday
    const res = computeAvailability({
      labId: 'lab-1',
      date: '2026-11-02',
      rules: mockRules,
      blackouts: [],
      confirmedBookings: [],
      slotDurationMinutes: 60,
    })

    assert.strictEqual(res.isBlackout, false)
    assert(res.slots.length > 0)
    assert(res.slots.every((s) => s.isAvailable === true))
  })

  it('flags slot as unavailable if overlapping with confirmed booking + turnaround buffer', () => {
    const res = computeAvailability({
      labId: 'lab-1',
      date: '2026-11-02',
      rules: mockRules,
      blackouts: [],
      confirmedBookings: [
        {
          id: 'b-conf-1',
          startTime: '2026-11-02T15:00:00.000Z',
          endTime: '2026-11-02T16:00:00.000Z',
          status: 'APPROVED',
        },
      ],
      bufferMinutes: 15,
      slotDurationMinutes: 60,
    })

    const slot15To16 = res.slots.find((s) => s.startTime.includes('15:00'))
    assert(slot15To16)
    assert.strictEqual(slot15To16.isAvailable, false)
    assert(slot15To16.reason?.includes('Conflicting booking'))
  })
})
