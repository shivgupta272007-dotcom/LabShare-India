import { describe, it } from 'node:test'
import assert from 'node:assert'
import { canTransition, getAvailableTransitions } from './state-machine.js'
import { BookingStatus, UserRole } from '../types/index.js'

describe('Booking State Machine (canTransition)', () => {
  const defaultCtx = {
    bookingSponsorId: 'user-sponsor-1',
    bookingOwnerOrgId: 'org-navodaya',
    actorUserId: 'user-manager-1',
    actorOrgId: 'org-navodaya',
    actorRole: 'MANAGER' as UserRole,
  }

  it('allows sponsor to submit DRAFT booking', () => {
    const res = canTransition({
      fromStatus: 'DRAFT',
      toStatus: 'SUBMITTED',
      actorRole: 'TEACHER_SPONSOR',
      actorUserId: 'user-sponsor-1',
      bookingSponsorId: 'user-sponsor-1',
      bookingOwnerOrgId: 'org-navodaya',
      actorOrgId: 'org-betwa',
    })
    assert.strictEqual(res.allowed, true)
  })

  it('blocks another non-sponsor user from submitting the draft', () => {
    const res = canTransition({
      fromStatus: 'DRAFT',
      toStatus: 'SUBMITTED',
      actorRole: 'TEACHER_SPONSOR',
      actorUserId: 'user-stranger-99',
      bookingSponsorId: 'user-sponsor-1',
      bookingOwnerOrgId: 'org-navodaya',
      actorOrgId: 'org-betwa',
    })
    assert.strictEqual(res.allowed, false)
    assert(res.error?.includes('designated Teacher Sponsor'))
  })

  it('allows manager of host school to approve PENDING_MANAGER', () => {
    const res = canTransition({
      ...defaultCtx,
      fromStatus: 'PENDING_MANAGER',
      toStatus: 'APPROVED',
    })
    assert.strictEqual(res.allowed, true)
  })

  it('strictly blocks manager of a DIFFERENT school from approving (IDOR protection)', () => {
    const res = canTransition({
      ...defaultCtx,
      actorOrgId: 'org-dps-jhansi', // Different school!
      fromStatus: 'PENDING_MANAGER',
      toStatus: 'APPROVED',
    })
    assert.strictEqual(res.allowed, false)
    assert(res.error?.includes('IDOR Prevention'))
  })

  it('allows manager of host school to check in an APPROVED booking on day of visit', () => {
    const res = canTransition({
      ...defaultCtx,
      fromStatus: 'APPROVED',
      toStatus: 'CHECKED_IN',
    })
    assert.strictEqual(res.allowed, true)
  })

  it('allows checkout to COMPLETED from CHECKED_IN', () => {
    const res = canTransition({
      ...defaultCtx,
      fromStatus: 'CHECKED_IN',
      toStatus: 'COMPLETED',
    })
    assert.strictEqual(res.allowed, true)
  })

  it('allows flagging incident from CHECKED_IN', () => {
    const res = canTransition({
      ...defaultCtx,
      fromStatus: 'CHECKED_IN',
      toStatus: 'INCIDENT_FLAGGED',
    })
    assert.strictEqual(res.allowed, true)
  })

  it('allows dispute to be raised on COMPLETED booking', () => {
    const res = canTransition({
      ...defaultCtx,
      fromStatus: 'COMPLETED',
      toStatus: 'DISPUTED',
    })
    assert.strictEqual(res.allowed, true)
  })

  it('allows ADMIN to resolve a DISPUTED booking', () => {
    const res = canTransition({
      ...defaultCtx,
      actorRole: 'ADMIN',
      fromStatus: 'DISPUTED',
      toStatus: 'RESOLVED',
    })
    assert.strictEqual(res.allowed, true)
  })

  it('blocks invalid backward transitions like COMPLETED -> DRAFT', () => {
    const res = canTransition({
      ...defaultCtx,
      fromStatus: 'COMPLETED',
      toStatus: 'DRAFT',
    })
    assert.strictEqual(res.allowed, false)
    assert(res.error?.includes('Invalid status transition'))
  })

  it('computes correct available transitions for manager', () => {
    const transitions = getAvailableTransitions('PENDING_MANAGER', 'MANAGER', false, true)
    assert.deepStrictEqual(transitions.sort(), ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].sort())
  })
})
