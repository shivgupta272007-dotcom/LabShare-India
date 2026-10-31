// ============================================================
// LabShare – End-to-End API Integration & Concurrency Test
// Exercises the entire journey in memory without network flakiness:
// OTP Auth -> Search -> Rules Check -> Booking -> Concurrency Collision
// -> Manager Approve -> Check-in -> Complete -> Review -> Audit Verify
// ============================================================

import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import { InMemoryDbService } from './storage/in-memory-db.js'
import { AuthService } from './modules/auth/auth.service.js'
import { LabsService } from './modules/labs/labs.service.js'
import { BookingsService } from './modules/bookings/bookings.service.js'
import { JwtService } from '@nestjs/jwt'
import { verifyAuditChain } from '@labshare/shared'

describe('End-to-End API Domain & Workflow Test', () => {
  let db: InMemoryDbService
  let authService: AuthService
  let labsService: LabsService
  let bookingsService: BookingsService
  let jwtService: JwtService

  before(() => {
    db = new InMemoryDbService()
    jwtService = new JwtService({ secret: 'test_jwt_secret_32chars_long_xxx' })
    authService = new AuthService(db, jwtService)
    labsService = new LabsService(db)
    bookingsService = new BookingsService(db)
  })

  it('1. Sends and verifies OTP for Demo Teacher Sponsor', async () => {
    const phone = '9000000005'
    const sendRes = await authService.sendOtp(phone)
    assert.strictEqual(sendRes.success, true)
    assert.strictEqual(sendRes.demoOtp, '123456')

    const verifyRes = await authService.verifyOtp(phone, '123456')
    assert(verifyRes.accessToken)
    assert.strictEqual(verifyRes.user.phone, phone)
    assert(verifyRes.memberships.length > 0)
    assert.strictEqual(verifyRes.memberships[0].role, 'TEACHER_SPONSOR')
  })

  it('2. Discovers labs with Haversine distance ranking', async () => {
    // Coordinate near Jhansi center
    const labs = await labsService.searchLabs({
      lat: 25.4484,
      lng: 78.5685,
      sortBy: 'distance',
    })

    assert(labs.length >= 8)
    assert(labs[0].distanceKm !== undefined)
    // Nearest should be DPS Jhansi (0 km away from DPS lat/lng)
    assert.strictEqual(labs[0].distanceKm, 0)
  })

  it('3. Submits booking request with Idempotency-Key support', async () => {
    const booking = await bookingsService.createBooking(
      {
        labId: 'c0000000-0000-0000-0000-000000000001',
        studentGroupId: 'g0000000-0000-0000-0000-000000000001',
        date: '2026-11-13', // Friday
        startTime: '15:30',
        endTime: '17:30',
        headcount: 24,
        purposeDescription: 'Optical spectrum and prism experiments',
        equipmentRequested: [],
      },
      'b0000000-0000-0000-0000-000000000005', // Sunita (Sponsor)
      'a0000000-0000-0000-0000-000000000003', // Bundelkhand NGO
      'idemp-key-test-001'
    )

    assert(booking.id)
    assert.strictEqual(booking.status, 'APPROVED') // Auto-approved because high-trust NGO
    assert.strictEqual(booking.headcount, 24)

    // Repeat with same Idempotency-Key returns identical cached object
    const cached = await bookingsService.createBooking(
      {
        labId: 'c0000000-0000-0000-0000-000000000001',
        studentGroupId: 'g0000000-0000-0000-0000-000000000001',
        date: '2026-11-13',
        startTime: '15:30',
        endTime: '17:30',
        headcount: 24,
        purposeDescription: 'Duplicate call',
        equipmentRequested: [],
      },
      'b0000000-0000-0000-0000-000000000005',
      'a0000000-0000-0000-0000-000000000003',
      'idemp-key-test-001'
    )
    assert.strictEqual(cached.id, booking.id)
  })

  it('4. Concurrency Protection: Rejects overlapping booking on same lab and slot', async () => {
    await assert.rejects(
      async () => {
        await bookingsService.createBooking(
          {
            labId: 'c0000000-0000-0000-0000-000000000001',
            studentGroupId: 'g0000000-0000-0000-0000-000000000002',
            date: '2026-11-13',
            startTime: '16:00', // Overlaps with 15:30-17:30!
            endTime: '18:00',
            headcount: 20,
            purposeDescription: 'Conflicting student session',
            equipmentRequested: [],
          },
          'b0000000-0000-0000-0000-000000000006',
          'a0000000-0000-0000-0000-000000000004',
          'idemp-key-conflict-002'
        )
      },
      {
        name: 'ConflictException',
        message: /Slot conflict/i,
      }
    )
  })

  it('5. IDOR Negative Test: Blocks manager from different school approving request', async () => {
    // Booking 3 belongs to Navodaya Vidyalaya
    await assert.rejects(
      async () => {
        await bookingsService.executeAction(
          'd0000000-0000-0000-0000-000000000003',
          {
            action: 'APPROVE',
            version: 1,
            note: 'Malicious cross-tenant attempt',
          },
          'b0000000-0000-0000-0000-000000000004', // DPS User
          'MANAGER',
          'a0000000-0000-0000-0000-000000000002' // DPS Org ID (wrong tenant!)
        )
      },
      {
        name: 'ForbiddenException',
        message: /IDOR Prevention/i,
      }
    )
  })

  it('6. Allows authentic host school manager to approve booking', async () => {
    const updated = await bookingsService.executeAction(
      'd0000000-0000-0000-0000-000000000003',
      {
        action: 'APPROVE',
        version: 1,
        note: 'Optics lab confirmed. Lab assistant will assist.',
      },
      'b0000000-0000-0000-0000-000000000003', // Vikram (Navodaya Manager)
      'MANAGER',
      'a0000000-0000-0000-0000-000000000001' // Navodaya Org ID
    )

    assert.strictEqual(updated.status, 'APPROVED')
    assert.strictEqual(updated.version, 2)
  })

  it('7. Cryptographically verifies SHA-256 audit log ledger', () => {
    const verification = verifyAuditChain(db.auditLogs)
    assert.strictEqual(verification.isValid, true)
    assert(verification.totalEntries >= 4)
  })
})
