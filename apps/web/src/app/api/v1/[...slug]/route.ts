import { NextRequest, NextResponse } from 'next/server'
import {
  Booking,
  DEMO_ACCOUNTS,
  DEMO_OTP,
  Dispute,
  Lab,
  MAJOR_INDIAN_CITIES,
  Organization,
  SEED_AUDIT_LOGS,
  SEED_BOOKINGS,
  SEED_DISPUTES,
  SEED_LABS,
  SEED_LAB_RULES,
  SEED_ORGANIZATIONS,
  SEED_REVIEWS,
  SEED_STUDENT_GROUPS,
  SEED_USERS,
  haversineDistanceKm,
} from '@labshare/shared'

// In-memory state for Vercel Serverless
let dynamicLabs: any[] = [...SEED_LABS]
let dynamicOrgs: any[] = [...SEED_ORGANIZATIONS]
let dynamicBookings: any[] = [...SEED_BOOKINGS]
let dynamicDisputes: any[] = [...SEED_DISPUTES]
let dynamicAuditLogs: any[] = [...SEED_AUDIT_LOGS]
let dynamicReviews: any[] = [...SEED_REVIEWS]
let dynamicStudentGroups: any[] = [...SEED_STUDENT_GROUPS]
let dynamicRules: any[] = [...SEED_LAB_RULES]

function appendAuditLog(action: string, entityType: string, entityId: string, actorRole: string = 'SYSTEM') {
  const prevHash = dynamicAuditLogs[0]?.hash || '0000000000000000000000000000000000000000000000000000000000000000'
  const seq = (dynamicAuditLogs[0]?.sequence || 0) + 1
  const id = `audit-${Date.now()}-${seq}`
  let hash = ''
  const hexChars = '0123456789abcdef'
  for (let i = 0; i < 64; i++) {
    hash += hexChars[Math.floor(Math.random() * 16)]
  }
  const log = {
    id,
    sequence: seq,
    previousHash: prevHash,
    hash,
    action,
    entityType,
    entityId,
    actorRole,
    createdAt: new Date().toISOString(),
  }
  dynamicAuditLogs.unshift(log)
  return log
}

function generateNearbyLabs(lat: number, lng: number, regionName?: string, stateName?: string) {
  if (!regionName || !stateName) {
    let closestCity = MAJOR_INDIAN_CITIES[0]
    let closestDist = 999999
    for (const city of MAJOR_INDIAN_CITIES) {
      const d = haversineDistanceKm(lat, lng, city.lat, city.lng)
      if (d < closestDist) {
        closestDist = d
        closestCity = city
      }
    }
    regionName = closestCity.name.split(',')[0].trim()
    stateName = closestCity.state
  }

  const orgPrefix = `org-${Math.round(Math.abs(lat) * 100)}-${Math.round(Math.abs(lng) * 100)}`

  const schools = [
    {
      orgId: `${orgPrefix}-jnv`,
      orgName: `Jawahar Navodaya Vidyalaya, ${regionName}`,
      lat: lat + 0.024,
      lng: lng - 0.018,
      labId: `lab-${orgPrefix}-science`,
      labName: `Advanced Composite Science & Robotics Lab`,
      labType: 'SCIENCE_LAB' as const,
      capacity: 35,
      description: `Fully equipped Central Govt. CBSE science laboratory featuring compound digital microscopes, analytical balances, optics benches, and robotics experimentation kits. Open for neighboring school visits after school hours.`,
      photos: [
        {
          id: `p-${orgPrefix}-1`,
          labId: `lab-${orgPrefix}-science`,
          url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
          caption: 'High-Tech Robotics Automation & Prototyping Workstation',
          isPrimary: true,
          order: 1,
        },
        {
          id: `p-${orgPrefix}-2`,
          labId: `lab-${orgPrefix}-science`,
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
          caption: 'Engineering Workbench & Microcontrollers',
          isPrimary: false,
          order: 2,
        },
      ],
    },
    {
      orgId: `${orgPrefix}-kv`,
      orgName: `Kendriya Vidyalaya, ${regionName} Cantt`,
      lat: lat - 0.028,
      lng: lng + 0.021,
      labId: `lab-${orgPrefix}-cs`,
      labName: `Modern High-Speed Computer & AI Lab`,
      labType: 'COMPUTER_LAB' as const,
      capacity: 40,
      description: `Air-conditioned computer lab with 40 Intel Core i7 terminals, gigabit fiber connection, pre-installed Python, Scratch, and Linux development suites. Ideal for rural coaching batches and coding workshops.`,
      photos: [
        {
          id: `p-${orgPrefix}-cs-1`,
          labId: `lab-${orgPrefix}-cs`,
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          caption: 'High-Performance Workstation Floor (40 Terminals)',
          isPrimary: true,
          order: 1,
        },
      ],
    },
  ]

  for (const s of schools) {
    if (!dynamicOrgs.some((o) => o.id === s.orgId)) {
      dynamicOrgs.push({
        id: s.orgId,
        name: s.orgName,
        type: 'OWNER_SCHOOL',
        verificationStatus: 'VERIFIED',
        udiseCode: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
        address: `Navodaya / Model Campus, ${regionName}`,
        district: regionName,
        state: stateName,
        pincode: '284001',
        phone: '919876543210',
        email: 'contact@navodaya.gov.in',
        isSuspended: false,
        lat: s.lat,
        lng: s.lng,
        trustScore: 96,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    if (!dynamicLabs.some((l) => l.id === s.labId)) {
      dynamicLabs.push({
        id: s.labId,
        organizationId: s.orgId,
        name: s.labName,
        type: s.labType,
        description: s.description,
        capacity: s.capacity,
        floor: 1,
        buildingName: 'Academic Block',
        lat: s.lat,
        lng: s.lng,
        isAccessible: true,
        averageRating: 4.9,
        totalBookings: 38,
        totalHoursShared: 114,
        trustScore: 96,
        photos: s.photos,
        isActive: true,
        currentRules: {
          maxGroupSize: s.capacity,
          advanceNoticeDays: 2,
          supervisionRatioAdults: 1,
          supervisionRatioStudents: 15,
          allowedDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
          allowedStartTime: '15:30',
          allowedEndTime: '18:30',
          requiresVerifiedSponsor: true,
          version: 1,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const path = params.slug.join('/')
  const url = new URL(req.url)

  // Health
  if (path === 'health' || path === 'ready') {
    return NextResponse.json({ status: 'ok', platform: 'Vercel Serverless', uptime: process.uptime() })
  }

  // Labs List
  if (path === 'labs') {
    const latStr = url.searchParams.get('lat')
    const lngStr = url.searchParams.get('lng')
    const search = (url.searchParams.get('search') || url.searchParams.get('query') || '').toLowerCase()
    const type = url.searchParams.get('type')
    const district = url.searchParams.get('district')
    const city = url.searchParams.get('city')
    const state = url.searchParams.get('state')

    if (latStr && lngStr) {
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      if (!isNaN(lat) && !isNaN(lng)) {
        generateNearbyLabs(lat, lng, city || district || undefined, state || undefined)
      }
    }

    let labs = dynamicLabs.map((l) => {
      const org = dynamicOrgs.find((o) => o.id === l.organizationId)
      let distanceKm: number | undefined
      if (latStr && lngStr) {
        distanceKm =
          Math.round(
            haversineDistanceKm(
              parseFloat(latStr),
              parseFloat(lngStr),
              l.lat ?? 25.3725,
              l.lng ?? 78.7364
            ) * 10
          ) / 10
      }
      return { ...l, organization: org, distanceKm }
    })

    if (search) {
      labs = labs.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.type.toLowerCase().includes(search) ||
          (l.description || '').toLowerCase().includes(search) ||
          (l.organization?.name || '').toLowerCase().includes(search) ||
          (l.organization?.district || '').toLowerCase().includes(search) ||
          (l.organization?.state || '').toLowerCase().includes(search)
      )
    }

    if (type && type !== 'ALL') {
      labs = labs.filter((l) => l.type === type)
    }

    if (district && district !== 'ALL') {
      labs = labs.filter((l) => l.organization?.district.toLowerCase() === district.toLowerCase())
    }

    if (latStr && lngStr) {
      labs.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    }

    return NextResponse.json(labs)
  }

  // Single Lab
  if (path.startsWith('labs/')) {
    const subParts = path.split('/')
    const labId = subParts[1]
    const subAction = subParts[2]

    const lab = dynamicLabs.find((l) => l.id === labId)
    if (!lab) return NextResponse.json({ message: 'Lab not found' }, { status: 404 })

    const org = dynamicOrgs.find((o) => o.id === lab.organizationId)

    if (subAction === 'availability') {
      const date = url.searchParams.get('date') || '2026-11-06'
      return NextResponse.json({
        date,
        isBlackout: false,
        slots: [
          { startTime: '15:30', endTime: '16:30', isAvailable: true, label: '3:30 PM - 4:30 PM' },
          { startTime: '16:30', endTime: '17:30', isAvailable: true, label: '4:30 PM - 5:30 PM' },
          { startTime: '17:30', endTime: '18:30', isAvailable: true, label: '5:30 PM - 6:30 PM' },
        ],
      })
    }

    if (subAction === 'reviews') {
      const reviews = dynamicReviews.filter((r) => r.targetLabId === labId)
      return NextResponse.json(reviews)
    }

    return NextResponse.json({
      ...lab,
      organization: org,
      currentRules: lab.currentRules || {
        maxGroupSize: lab.capacity,
        advanceNoticeDays: 2,
        supervisionRatioAdults: 1,
        supervisionRatioStudents: 15,
        allowedDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        allowedStartTime: '15:30',
        allowedEndTime: '18:30',
        requiresVerifiedSponsor: true,
        version: 1,
      },
    })
  }

  // Bookings List
  if (path === 'bookings') {
    const bookings = dynamicBookings.map((b) => {
      const lab = dynamicLabs.find((l) => l.id === b.labId)
      const org = dynamicOrgs.find((o) => o.id === b.organizationId)
      return { ...b, lab, organization: org }
    })
    return NextResponse.json(bookings)
  }

  // Ops Schedule (Day-of Operations)
  if (path === 'ops/today') {
    const today = new Date().toISOString().split('T')[0]
    const active = dynamicBookings.filter((b) => b.status === 'CHECKED_IN').length
    const upcoming = dynamicBookings.filter((b) => b.status === 'APPROVED').length
    const bookings = dynamicBookings.map((b) => ({
      ...b,
      lab: dynamicLabs.find((l) => l.id === b.labId),
      organization: dynamicOrgs.find((o) => o.id === b.organizationId),
    }))
    return NextResponse.json({
      date: today,
      totalToday: bookings.length,
      activeNow: active,
      upcomingToday: upcoming,
      bookings,
    })
  }

  // Organizations
  if (path === 'organizations') {
    return NextResponse.json(dynamicOrgs)
  }

  // Student Groups
  if (path === 'student-groups') {
    return NextResponse.json(dynamicStudentGroups)
  }

  // Analytics Impact
  if (path === 'analytics/impact') {
    return NextResponse.json({
      totalLabHoursShared: 840,
      totalStudentsBenefited: 2450,
      totalSchoolsServed: 48,
      idleCapacityUtilisationPercent: 42.6,
      estimatedRupeeValueCreated: 4200000,
      safetyIncidents: 0,
      averageHostRating: 4.9,
    })
  }

  // District Heatmap
  if (path === 'analytics/districts') {
    return NextResponse.json([
      { district: 'Jhansi', state: 'Uttar Pradesh', bookingCount: 64, labHours: 192, studentCount: 2240 },
      { district: 'Lalitpur', state: 'Uttar Pradesh', bookingCount: 28, labHours: 84, studentCount: 980 },
      { district: 'Jalaun', state: 'Uttar Pradesh', bookingCount: 22, labHours: 66, studentCount: 770 },
      { district: 'Mahoba', state: 'Uttar Pradesh', bookingCount: 16, labHours: 48, studentCount: 560 },
      { district: 'Hamirpur', state: 'Uttar Pradesh', bookingCount: 12, labHours: 36, studentCount: 420 },
      { district: 'Banda', state: 'Uttar Pradesh', bookingCount: 10, labHours: 30, studentCount: 350 },
      { district: 'Chitrakoot', state: 'Uttar Pradesh', bookingCount: 8, labHours: 24, studentCount: 280 },
    ])
  }

  // Trust Score Breakdown
  if (path.startsWith('analytics/trust-score/')) {
    const subParts = path.split('/')
    const orgId = subParts[2]
    const org = dynamicOrgs.find((o) => o.id === orgId) || dynamicOrgs[0]
    return NextResponse.json({
      organizationId: org.id,
      score: org.trustScore || 96,
      completedBookings: 24,
      onTimeRate: 100,
      zeroIncidentRate: 100,
      averageRating: 4.9,
      breakdown: {
        completedBookingsScore: 25,
        onTimeScore: 20,
        incidentScore: 20,
        ratingScore: 15,
        disputeScore: 10,
        noShowScore: 5,
        ageScore: 5,
        explanation: 'Exemplary community track record. Full marks across on-time arrival, equipment care, and adult supervision.',
        explanationHi: 'अनुकरणीय सामुदायिक रिकॉर्ड। समय पर आगमन, प्रयोगशाला उपकरणों की सुरक्षा और पूर्ण उपस्थिति।',
      },
    })
  }

  // Admin Audit Ledger
  if (path === 'admin/audit') {
    return NextResponse.json(dynamicAuditLogs)
  }

  // Admin Audit Chain Verification
  if (path === 'admin/audit/verify') {
    return NextResponse.json({
      isValid: true,
      totalEntries: dynamicAuditLogs.length,
      statusBadge: 'SECURE',
      timestamp: new Date().toISOString(),
    })
  }

  // Admin Disputes
  if (path === 'admin/disputes') {
    return NextResponse.json(dynamicDisputes)
  }

  // Auth me
  if (path === 'auth/me') {
    const defaultUser = SEED_USERS[4] // Sunita Sharma (Teacher Sponsor)
    return NextResponse.json({
      user: defaultUser,
      activeMembership: {
        role: 'TEACHER_SPONSOR',
        organization: dynamicOrgs.find((o) => o.id === 'a0000000-0000-0000-0000-000000000003'),
      },
    })
  }

  return NextResponse.json({ message: `Not found: ${path}` }, { status: 404 })
}

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const path = params.slug.join('/')
  const body = await req.json().catch(() => ({}))

  // Send OTP
  if (path === 'auth/otp/send') {
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (Demo OTP: 123456)',
      demoOtp: DEMO_OTP,
    })
  }

  // Verify OTP
  if (path === 'auth/otp/verify') {
    const phone = body.phone || '9876543210'
    const account = DEMO_ACCOUNTS.find((a) => a.phone === phone) || DEMO_ACCOUNTS[0]
    const user = SEED_USERS.find((u) => u.phone === phone) || SEED_USERS[4]
    const org = dynamicOrgs.find((o) => o.name === account.org) || dynamicOrgs[0]

    return NextResponse.json({
      accessToken: 'demo-jwt-token-vercel',
      refreshToken: 'demo-refresh-token-vercel',
      user: { ...user, phone },
      memberships: [{ role: account.role, organization: org }],
    })
  }

  // Demo Switch
  if (path === 'auth/demo-switch') {
    const role = body.role || 'TEACHER_SPONSOR'
    const account = DEMO_ACCOUNTS.find((a) => a.role === role) || DEMO_ACCOUNTS[0]
    const user = SEED_USERS.find((u) => u.phone === account.phone) || SEED_USERS[0]
    return NextResponse.json({
      accessToken: 'demo-jwt-token-vercel',
      user,
      activeRole: role,
    })
  }

  // Create Lab (Lifecycle Step 1)
  if (path === 'labs') {
    const newLab = {
      id: `lab-${Date.now()}`,
      organizationId: body.organizationId || dynamicOrgs[0].id,
      name: body.name || 'Science Laboratory',
      type: body.type || 'SCIENCE_LAB',
      description: body.description || 'Equipped laboratory space open for educational visits.',
      capacity: Number(body.capacity) || 30,
      floor: Number(body.floor) || 1,
      buildingName: body.buildingName || 'Main Block',
      lat: Number(body.lat) || dynamicOrgs[0].lat || 25.4484,
      lng: Number(body.lng) || dynamicOrgs[0].lng || 78.5685,
      isActive: true,
      isAccessible: body.isAccessible ?? true,
      accessibilityNotes: body.accessibilityNotes || 'Ground floor access, ramp available.',
      safetyNotes: body.safetyNotes || 'Safety goggles and aprons provided. Eyewash station installed.',
      trustScore: 98,
      totalBookings: 0,
      totalHoursShared: 0,
      averageRating: 5.0,
      photos: body.photos || [
        {
          id: `photo-${Date.now()}`,
          url: body.primaryPhotoUrl || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
          caption: body.name || 'Laboratory Room',
          isPrimary: true,
          order: 1,
        },
      ],
      currentRules: {
        maxGroupSize: Number(body.capacity) || 30,
        minClassStandard: 6,
        supervisionRatioStudents: 15,
        autoApproveForTrustedScore: 85,
        allowedDays: ['MON', 'WED', 'FRI', 'SAT'],
        allowedStartTime: '15:30',
        allowedEndTime: '18:30',
        advanceNoticeDays: 2,
        requiresVerifiedSponsor: true,
        version: 1,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dynamicLabs.unshift(newLab)
    appendAuditLog('LAB_LISTED', 'Lab', newLab.id, 'OWNER_SCHOOL')
    return NextResponse.json(newLab, { status: 201 })
  }

  // Update Lab Rules (Lifecycle Step 1)
  if (path.startsWith('labs/') && path.endsWith('/rules')) {
    const subParts = path.split('/')
    const labId = subParts[1]
    const lab = dynamicLabs.find((l) => l.id === labId)
    if (!lab) return NextResponse.json({ message: 'Lab not found' }, { status: 404 })

    const nextVersion = (lab.currentRules?.version || 1) + 1
    lab.currentRules = {
      ...lab.currentRules,
      ...body,
      version: nextVersion,
    }
    appendAuditLog('RULES_CONFIGURED', 'LabRules', `${labId}-v${nextVersion}`, 'OWNER_SCHOOL')
    return NextResponse.json(lab.currentRules)
  }

  // Rules Evaluation (Lifecycle Step 4)
  if (path === 'rules/evaluate') {
    const lab = dynamicLabs.find((l) => l.id === body.labId) || dynamicLabs[0]
    const rules = lab.currentRules || {
      maxGroupSize: lab.capacity,
      allowedDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      allowedStartTime: '15:00',
      allowedEndTime: '18:30',
      minClassStandard: 6,
      supervisionRatioStudents: 15,
      autoApproveForTrustedScore: 85,
    }
    const headcount = Number(body.headcount) || 24
    const passed = headcount <= (rules.maxGroupSize || lab.capacity)
    return NextResponse.json({
      decision: passed ? 'PASS' : 'FAIL',
      reasons: passed
        ? [
            'Group headcount is within safe laboratory capacity limits.',
            'Adult supervision declaration and minor consent verified.',
            'Operating hours and weekday criteria met.',
          ]
        : [`Group headcount (${headcount}) exceeds lab safety capacity (${rules.maxGroupSize}).`],
      autoApproved: passed,
      evaluatedAt: new Date().toISOString(),
    })
  }

  // Create Booking (Lifecycle Step 3)
  if (path === 'bookings') {
    const newBooking: any = {
      id: `booking-${Date.now()}`,
      labId: body.labId || dynamicLabs[0].id,
      organizationId: 'a0000000-0000-0000-0000-000000000003',
      sponsorUserId: 'b0000000-0000-0000-0000-000000000005',
      studentGroupId: body.studentGroupId || 'd0000000-0000-0000-0000-000000000001',
      rulesVersionId: 'rules-1',
      version: 1,
      startTime: `${body.date || '2026-11-06'}T${body.startTime || '15:30'}:00.000Z`,
      endTime: `${body.date || '2026-11-06'}T${body.endTime || '17:30'}:00.000Z`,
      date: body.date || '2026-11-06',
      status: 'PENDING_MANAGER' as const,
      checkInCode: Math.floor(100000 + Math.random() * 900000).toString(),
      headcount: body.headcount || 24,
      purposeDescription: body.purposeDescription || body.purpose || 'STEM Practical Experiments',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dynamicBookings.unshift(newBooking)
    appendAuditLog('BOOKING_REQUESTED', 'Booking', newBooking.id, 'TEACHER_SPONSOR')
    return NextResponse.json(newBooking, { status: 201 })
  }

  // Booking Action: Approve, Waitlist, Reject, Request Changes (Lifecycle Step 5 & 6)
  if (path.startsWith('bookings/') && path.endsWith('/action')) {
    const subParts = path.split('/')
    const bookingId = subParts[1]
    const booking = dynamicBookings.find((b) => b.id === bookingId)
    if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 })

    const action = body.action
    if (action === 'APPROVE') {
      booking.status = 'APPROVED'
      booking.checkInCode = booking.checkInCode || Math.floor(100000 + Math.random() * 900000).toString()
    } else if (action === 'WAITLIST') {
      booking.status = 'WAITLISTED'
      booking.waitlistPosition = 1
    } else if (action === 'REJECT') {
      booking.status = 'REJECTED'
      booking.rejectionReason = body.note || 'Slot unavailable'
    } else if (action === 'REQUEST_CHANGES') {
      booking.status = 'CHANGES_REQUESTED'
    }
    booking.managerNote = body.note
    booking.updatedAt = new Date().toISOString()
    appendAuditLog(`BOOKING_${action}`, 'Booking', bookingId, 'MANAGER')
    return NextResponse.json(booking)
  }

  // Day-of Check-In (Lifecycle Step 7 - Initial Condition Recording)
  if (path === 'ops/check-in') {
    const booking = dynamicBookings.find((b) => b.id === body.bookingId)
    if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 })

    booking.status = 'CHECKED_IN'
    booking.checkInAt = new Date().toISOString()
    booking.actualHeadcount = body.actualHeadcount || booking.headcount
    booking.initialConditionNotes =
      body.initialConditionNotes || 'Lab in clean condition. All instruments, apparatus, and workstations intact.'
    appendAuditLog('CHECK_IN_INITIAL_CONDITION', 'Booking', booking.id, 'MANAGER')
    return NextResponse.json({ success: true, booking })
  }

  // Day-of Check-Out (Lifecycle Step 8 - Final Condition & Return Recording)
  if (path === 'ops/check-out') {
    const booking = dynamicBookings.find((b) => b.id === body.bookingId)
    if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 })

    booking.checkOutAt = new Date().toISOString()
    booking.damageFlagged = Boolean(body.damageFlagged)
    booking.damageNotes = body.damageNotes
    booking.finalConditionNotes =
      body.finalConditionNotes ||
      (body.damageFlagged
        ? `Damage detected: ${body.damageNotes}`
        : 'Session completed. Equipment returned clean and accounted for.')

    if (body.damageFlagged) {
      booking.status = 'DISPUTED'
      const newDispute = {
        id: `disp-${Date.now()}`,
        bookingId: booking.id,
        title: `Damage Claim: ${booking.lab?.name || 'Laboratory Session'}`,
        description: body.damageNotes || 'Equipment damage reported during checkout inspection.',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        comments: [
          {
            id: `c-${Date.now()}`,
            content: `Checkout inspection note: ${body.damageNotes}`,
            authorRole: 'MANAGER',
            createdAt: new Date().toISOString(),
          },
        ],
      }
      dynamicDisputes.unshift(newDispute)
      appendAuditLog('DAMAGE_INCIDENT_FLAGGED', 'Dispute', newDispute.id, 'MANAGER')
    } else {
      booking.status = 'COMPLETED'
      appendAuditLog('CHECK_OUT_FINAL_CONDITION', 'Booking', booking.id, 'MANAGER')
    }

    return NextResponse.json({ success: true, booking })
  }

  // Submit Review (Lifecycle Step 10)
  if (path === 'reviews') {
    const newReview = {
      id: `rev-${Date.now()}`,
      bookingId: body.bookingId,
      targetLabId: body.labId || dynamicLabs[0].id,
      rating: body.rating || 5,
      comment: body.comment || 'Practical learning experience was excellent for students.',
      isPublic: true,
      createdAt: new Date().toISOString(),
    }
    dynamicReviews.unshift(newReview)
    const booking = dynamicBookings.find((b) => b.id === body.bookingId)
    if (booking) booking.review = newReview
    appendAuditLog('REVIEW_RECORDED', 'Review', newReview.id, 'TEACHER_SPONSOR')
    return NextResponse.json(newReview, { status: 201 })
  }

  // Resolve Dispute Tribunal Ruling (Lifecycle Step 9)
  if (path.startsWith('admin/disputes/') && path.endsWith('/resolve')) {
    const subParts = path.split('/')
    const disputeId = subParts[2]
    const dispute = dynamicDisputes.find((d) => d.id === disputeId)
    if (!dispute) return NextResponse.json({ message: 'Dispute not found' }, { status: 404 })

    dispute.status = 'RESOLVED'
    dispute.resolution = body.resolution || 'Official tribunal ruling issued under platform educational buffer.'
    dispute.adminNote = body.adminNote
    dispute.resolvedAt = new Date().toISOString()
    appendAuditLog('DISPUTE_TRIBUNAL_RULING', 'Dispute', disputeId, 'ADMIN')
    return NextResponse.json(dispute)
  }

  // Admin Org Verification
  if (path.startsWith('admin/organizations/') && path.endsWith('/verify')) {
    const subParts = path.split('/')
    const orgId = subParts[2]
    const org = dynamicOrgs.find((o) => o.id === orgId)
    if (org) {
      org.verificationStatus = body.status || 'VERIFIED'
      appendAuditLog('ORG_VERIFICATION', 'Organization', orgId, 'ADMIN')
    }
    return NextResponse.json({ success: true, org })
  }

  // Admin Org Suspension
  if (path.startsWith('admin/organizations/') && path.endsWith('/suspend')) {
    const subParts = path.split('/')
    const orgId = subParts[2]
    const org = dynamicOrgs.find((o) => o.id === orgId)
    if (org) {
      org.isSuspended = true
      org.suspensionReason = body.reason || 'Administrative suspension'
      appendAuditLog('ORG_SUSPENDED', 'Organization', orgId, 'ADMIN')
    }
    return NextResponse.json({ success: true, org })
  }

  return NextResponse.json({ message: `Not found: ${path}` }, { status: 404 })
}
