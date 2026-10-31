// ============================================================
// LabShare – Audit Hash Chaining (Cryptographic Immutability)
// Pure isomorphic SHA-256 implementation (Runs in Node, Browser & Edge)
// ============================================================

import { AuditAction, AuditLog, UserRole } from '../types/index.js'

export const AUDIT_GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Standard pure-JS SHA-256 implementation (zero external or node:* dependencies)
 */
function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount))
  }

  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  let i = 0, j = 0
  let result = ''

  const words: number[] = []
  const asciiBitLength = ascii.length * 8

  const hash: number[] = []
  const k: number[] = []
  let primeCounter = 0

  const isComposite: Record<number, number> = {}
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = candidate
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
    }
  }

  ascii += '\x80'
  while ((ascii.length % 64) - 56) ascii += '\x00'
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i)
    words[i >> 2] |= j << (((3 - i) % 4) * 8)
  }
  words[words.length] = (asciiBitLength / maxWord) | 0
  words[words.length] = asciiBitLength | 0

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16))
    const oldHash = hash.slice(0)

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2]

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)
      w[i] =
        i < 16
          ? w[i]
          : (((w[i - 16] + s0) | 0) + ((w[i - 7] + s1) | 0)) | 0

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6])
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2])
      const s1_0 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)
      const s0_0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)
      const temp1 = (((hash[7] + s1_0) | 0) + ((ch + k[i]) | 0) + w[i]) | 0
      const temp2 = ((s0_0 + maj) | 0)

      hash[7] = hash[6]
      hash[6] = hash[5]
      hash[5] = hash[4]
      hash[4] = (hash[3] + temp1) | 0
      hash[3] = hash[2]
      hash[2] = hash[1]
      hash[1] = hash[0]
      hash[0] = (temp1 + temp2) | 0
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255
      result += (b < 16 ? '0' : '') + b.toString(16)
    }
  }
  return result
}

export interface CreateAuditEntryInput {
  sequence: number
  actorId?: string
  actorRole?: UserRole
  action: AuditAction
  entityType: string
  entityId?: string
  organizationId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ip?: string
  userAgent?: string
  requestId?: string
  prevHash: string
  createdAt?: string
}

/**
 * Computes canonical SHA-256 hash
 */
export function computeAuditHash(entry: {
  sequence: number | bigint
  actorId?: string
  actorRole?: string
  action: string
  entityType: string
  entityId?: string
  organizationId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ip?: string
  userAgent?: string
  requestId?: string
  prevHash: string
  createdAt: string
}): string {
  const canonicalPayload = JSON.stringify({
    seq: entry.sequence.toString(),
    act: entry.actorId || '',
    rol: entry.actorRole || '',
    op: entry.action,
    typ: entry.entityType,
    eid: entry.entityId || '',
    oid: entry.organizationId || '',
    bef: entry.before ? JSON.stringify(entry.before) : '',
    aft: entry.after ? JSON.stringify(entry.after) : '',
    ip: entry.ip || '',
    ua: entry.userAgent || '',
    rid: entry.requestId || '',
    prev: entry.prevHash,
    ts: entry.createdAt,
  })

  return sha256Pure(canonicalPayload)
}

export interface VerificationResult {
  isValid: boolean
  totalEntries: number
  brokenAtSequence?: number
  expectedHash?: string
  actualHash?: string
  error?: string
}

/**
 * Verifies an entire sequence of audit log entries from genesis to current
 */
export function verifyAuditChain(entries: AuditLog[]): VerificationResult {
  if (entries.length === 0) {
    return { isValid: true, totalEntries: 0 }
  }

  const sorted = [...entries].sort((a, b) => Number(a.sequence) - Number(b.sequence))
  let expectedPrevHash = AUDIT_GENESIS_HASH

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]
    const seq = Number(entry.sequence)

    if (i === 0 && entry.prevHash !== AUDIT_GENESIS_HASH && entry.prevHash !== '') {
      expectedPrevHash = entry.prevHash
    }

    if (entry.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalEntries: entries.length,
        brokenAtSequence: seq,
        expectedHash: expectedPrevHash,
        actualHash: entry.prevHash,
        error: `Broken link at sequence ${seq}: prevHash mismatch. Expected ${expectedPrevHash}, found ${entry.prevHash}`,
      }
    }

    const recomputedHash = computeAuditHash({
      sequence: entry.sequence,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      organizationId: entry.organizationId,
      before: entry.before,
      after: entry.after,
      ip: entry.ip,
      userAgent: entry.userAgent,
      requestId: entry.requestId,
      prevHash: entry.prevHash,
      createdAt: entry.createdAt,
    })

    if (entry.hash !== recomputedHash) {
      return {
        isValid: false,
        totalEntries: entries.length,
        brokenAtSequence: seq,
        expectedHash: recomputedHash,
        actualHash: entry.hash,
        error: `Tampered record at sequence ${seq}: hash mismatch. Expected ${recomputedHash}, stored ${entry.hash}`,
      }
    }

    expectedPrevHash = entry.hash
  }

  return {
    isValid: true,
    totalEntries: entries.length,
  }
}
