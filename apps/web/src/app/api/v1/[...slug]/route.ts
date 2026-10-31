import { NextRequest, NextResponse } from 'next/server'
import {
  DEMO_ACCOUNTS,
  DEMO_OTP,
  MAJOR_INDIAN_CITIES,
  SEED_BOOKINGS,
  SEED_LABS,
  SEED_ORGANIZATIONS,
  SEED_REVIEWS,
  SEED_USERS,
  haversineDistanceKm,
} from '@labshare/shared'

// In-memory state for Vercel Serverless
let dynamicLabs = [...SEED_LABS]
let dynamicOrgs = [...SEED_ORGANIZATIONS]
let dynamicBookings = [...SEED_BOOKINGS]

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
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const type = url.searchParams.get('type')
    const district = url.searchParams.get('district')
    const state = url.searchParams.get('state')

    if (latStr && lngStr) {
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      if (!isNaN(lat) && !isNaN(lng)) {
        generateNearbyLabs(lat, lng, district || undefined, state || undefined)
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
          l.organization?.name.toLowerCase().includes(search) ||
          l.organization?.district.toLowerCase().includes(search) ||
          l.organization?.state.toLowerCase().includes(search)
      )
    }

    if (type && type !== 'ALL') {
      labs = labs.filter((l) => l.type === type)
    }

    if (district) {
      labs = labs.filter((l) => l.organization?.district.toLowerCase() === district.toLowerCase())
    }

    if (latStr && lngStr) {
      labs.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    }

    return NextResponse.json({ data: labs, total: labs.length })
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
      const reviews = SEED_REVIEWS.filter((r) => r.targetLabId === labId)
      return NextResponse.json(reviews)
    }

    return NextResponse.json({
      ...lab,
      organization: org,
      currentRules: {
        maxGroupSize: lab.capacity,
        advanceNoticeDays: 2,
        supervisionRatioAdults: 1,
        supervisionRatioStudents: 15,
        allowedDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        allowedStartTime: '15:30',
        allowedEndTime: '18:30',
        requiresVerifiedSponsor: true,
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

  // Create Booking
  if (path === 'bookings') {
    const newBooking: any = {
      id: `booking-${Date.now()}`,
      labId: body.labId || dynamicLabs[0].id,
      organizationId: 'a0000000-0000-0000-0000-000000000003',
      sponsorUserId: 'b0000000-0000-0000-0000-000000000005',
      studentGroupId: 'd0000000-0000-0000-0000-000000000001',
      rulesVersionId: 'rules-1',
      version: 1,
      startTime: `${body.date || '2026-11-06'}T${body.startTime || '15:30'}:00.000Z`,
      endTime: `${body.date || '2026-11-06'}T${body.endTime || '17:30'}:00.000Z`,
      status: 'APPROVED' as const,
      headcount: body.headcount || 25,
      purpose: body.purpose || 'STEM Practical Experiments',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dynamicBookings.unshift(newBooking)
    return NextResponse.json(newBooking, { status: 201 })
  }

  return NextResponse.json({ message: `Not found: ${path}` }, { status: 404 })
}
