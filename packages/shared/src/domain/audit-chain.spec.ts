import { describe, it } from 'node:test'
import assert from 'node:assert'
import { AUDIT_GENESIS_HASH, computeAuditHash, verifyAuditChain } from './audit-chain.js'
import { AuditLog } from '../types/index.js'

describe('Audit Hash Chain (computeAuditHash & verifyAuditChain)', () => {
  it('validates an untampered sequential audit chain', () => {
    const time1 = '2026-11-01T10:00:00.000Z'
    const time2 = '2026-11-01T10:05:00.000Z'
    const time3 = '2026-11-01T10:10:00.000Z'

    const hash1 = computeAuditHash({
      sequence: 1,
      action: 'OTP_VERIFIED',
      entityType: 'User',
      entityId: 'user-1',
      prevHash: AUDIT_GENESIS_HASH,
      createdAt: time1,
    })

    const hash2 = computeAuditHash({
      sequence: 2,
      action: 'BOOKING_STATUS_CHANGE',
      entityType: 'Booking',
      entityId: 'booking-1',
      prevHash: hash1,
      createdAt: time2,
    })

    const hash3 = computeAuditHash({
      sequence: 3,
      action: 'ORG_VERIFICATION',
      entityType: 'Organization',
      entityId: 'org-1',
      prevHash: hash2,
      createdAt: time3,
    })

    const chain: AuditLog[] = [
      {
        id: 'aud-1',
        sequence: 1,
        action: 'OTP_VERIFIED',
        entityType: 'User',
        entityId: 'user-1',
        prevHash: AUDIT_GENESIS_HASH,
        hash: hash1,
        createdAt: time1,
      },
      {
        id: 'aud-2',
        sequence: 2,
        action: 'BOOKING_STATUS_CHANGE',
        entityType: 'Booking',
        entityId: 'booking-1',
        prevHash: hash1,
        hash: hash2,
        createdAt: time2,
      },
      {
        id: 'aud-3',
        sequence: 3,
        action: 'ORG_VERIFICATION',
        entityType: 'Organization',
        entityId: 'org-1',
        prevHash: hash2,
        hash: hash3,
        createdAt: time3,
      },
    ]

    const result = verifyAuditChain(chain)
    assert.strictEqual(result.isValid, true)
    assert.strictEqual(result.totalEntries, 3)
  })

  it('detects tampering when payload or hash in middle of chain is altered', () => {
    const time1 = '2026-11-01T10:00:00.000Z'
    const time2 = '2026-11-01T10:05:00.000Z'

    const hash1 = computeAuditHash({
      sequence: 1,
      action: 'OTP_VERIFIED',
      entityType: 'User',
      entityId: 'user-1',
      prevHash: AUDIT_GENESIS_HASH,
      createdAt: time1,
    })

    const hash2 = computeAuditHash({
      sequence: 2,
      action: 'BOOKING_STATUS_CHANGE',
      entityType: 'Booking',
      entityId: 'booking-1',
      prevHash: hash1,
      createdAt: time2,
    })

    const tamperedChain: AuditLog[] = [
      {
        id: 'aud-1',
        sequence: 1,
        action: 'OTP_VERIFIED',
        entityType: 'User',
        entityId: 'user-1',
        prevHash: AUDIT_GENESIS_HASH,
        hash: hash1,
        createdAt: time1,
      },
      {
        id: 'aud-2',
        sequence: 2,
        action: 'BOOKING_STATUS_CHANGE',
        entityType: 'Booking',
        entityId: 'booking-1',
        prevHash: hash1,
        hash: 'malicious_tampered_hash_0000000000000000000000000000000000000000', // Tampered!
        createdAt: time2,
      },
    ]

    const result = verifyAuditChain(tamperedChain)
    assert.strictEqual(result.isValid, false)
    assert.strictEqual(result.brokenAtSequence, 2)
    assert(result.error?.includes('Tampered record'))
  })
})
