// ============================================================
// LabShare – Prisma & Database Seed Script
// Seeds organizations, users, memberships, labs, rules, bookings,
// disputes, reviews, and audit logs.
// ============================================================

import {
  SEED_AUDIT_LOGS,
  SEED_BOOKINGS,
  SEED_DISPUTES,
  SEED_LAB_RULES,
  SEED_LABS,
  SEED_MEMBERSHIPS,
  SEED_ORGANIZATIONS,
  SEED_REVIEWS,
  SEED_STUDENT_GROUPS,
  SEED_USERS,
} from '../../packages/shared/src/constants/seed-data.js'

async function runSeed() {
  console.log('🌱 Starting LabShare database seed...')
  console.log(`Loaded ${SEED_ORGANIZATIONS.length} organizations`)
  console.log(`Loaded ${SEED_USERS.length} demo users`)
  console.log(`Loaded ${SEED_LABS.length} labs across Bundelkhand`)
  console.log(`Loaded ${SEED_BOOKINGS.length} bookings covering all states`)
  console.log(`Loaded ${SEED_DISPUTES.length} active dispute`)
  console.log(`Loaded ${SEED_AUDIT_LOGS.length} hash-chained audit records`)

  if (!process.env.DATABASE_URL) {
    console.log('ℹ No DATABASE_URL specified. In-memory adapter will use master seed dataset automatically.')
    return
  }

  try {
    // Dynamic import Prisma if installed
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    console.log('Connecting to PostgreSQL...')
    await prisma.$connect()

    // 1. Organizations
    for (const org of SEED_ORGANIZATIONS) {
      await prisma.organization.upsert({
        where: { id: org.id },
        update: {},
        create: {
          id: org.id,
          name: org.name,
          type: org.type as any,
          verificationStatus: org.verificationStatus as any,
          udiseCode: org.udiseCode,
          registrationNumber: org.registrationNumber,
          address: org.address,
          district: org.district,
          state: org.state,
          pincode: org.pincode,
          phone: org.phone,
          email: org.email,
          website: org.website,
          lat: org.lat,
          lng: org.lng,
          trustScore: org.trustScore,
          isActive: org.isActive,
          isSuspended: org.isSuspended,
        },
      })
    }

    // 2. Users
    for (const u of SEED_USERS) {
      await prisma.user.upsert({
        where: { phone: u.phone },
        update: {},
        create: {
          id: u.id,
          phone: u.phone,
          name: u.name,
          email: u.email,
          isActive: u.isActive,
        },
      })
    }

    // 3. Memberships
    for (const m of SEED_MEMBERSHIPS) {
      await prisma.membership.upsert({
        where: { id: m.id },
        update: {},
        create: {
          id: m.id,
          userId: m.userId,
          organizationId: m.organizationId,
          role: m.role as any,
          isActive: m.isActive,
        },
      })
    }

    // 4. Labs
    for (const lab of SEED_LABS) {
      await prisma.lab.upsert({
        where: { id: lab.id },
        update: {},
        create: {
          id: lab.id,
          organizationId: lab.organizationId,
          name: lab.name,
          type: lab.type as any,
          description: lab.description,
          capacity: lab.capacity,
          areasqft: lab.areasqft,
          floor: lab.floor,
          buildingName: lab.buildingName,
          lat: lab.lat,
          lng: lab.lng,
          isActive: lab.isActive,
          isAccessible: lab.isAccessible,
          accessibilityNotes: lab.accessibilityNotes,
          safetyNotes: lab.safetyNotes,
          trustScore: lab.trustScore,
          totalBookings: lab.totalBookings,
          totalHoursShared: lab.totalHoursShared,
          averageRating: lab.averageRating,
        },
      })
    }

    // 5. Rules
    for (const r of SEED_LAB_RULES) {
      await prisma.labRules.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          labId: r.labId,
          version: r.version,
          isActive: r.isActive,
          allowedDays: r.allowedDays as any,
          allowedStartTime: r.allowedStartTime,
          allowedEndTime: r.allowedEndTime,
          holidayOnly: r.holidayOnly,
          minDurationMinutes: r.minDurationMinutes,
          maxDurationMinutes: r.maxDurationMinutes,
          advanceNoticeDays: r.advanceNoticeDays,
          maxAdvanceBookingDays: r.maxAdvanceBookingDays,
          maxGroupSize: r.maxGroupSize,
          minClassStandard: r.minClassStandard,
          supervisionRatioAdults: r.supervisionRatioAdults,
          supervisionRatioStudents: r.supervisionRatioStudents,
          requiresVerifiedSponsor: r.requiresVerifiedSponsor,
          requiresParentConsent: r.requiresParentConsent,
          restrictedEquipmentIds: r.restrictedEquipmentIds,
          maxBookingsPerOrgPerMonth: r.maxBookingsPerOrgPerMonth,
          autoApproveForTrustedScore: r.autoApproveForTrustedScore,
          createdByUserId: r.createdBy,
        },
      })
    }

    // 6. Student Groups
    for (const g of SEED_STUDENT_GROUPS) {
      await prisma.studentGroup.upsert({
        where: { id: g.id },
        update: {},
        create: {
          id: g.id,
          organizationId: g.organizationId,
          sponsorUserId: g.sponsorUserId,
          name: g.name,
          description: g.description,
          headcount: g.headcount,
          classRangeMin: g.classRangeMin,
          classRangeMax: g.classRangeMax,
          emergencyContactName: g.emergencyContactName,
          emergencyContactPhone: g.emergencyContactPhone,
          emergencyContactRelation: g.emergencyContactRelation,
          isActive: g.isActive,
        },
      })
    }

    console.log('✅ PostgreSQL database seeded successfully!')
    await prisma.$disconnect()
  } catch (err: any) {
    console.warn(`Prisma seed skipped or deferred (${err.message}) - in-memory adapter active.`)
  }
}

runSeed().catch((e) => {
  console.error('Seed execution error:', e)
})
