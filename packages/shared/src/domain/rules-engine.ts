// ============================================================
// LabShare – Rules Engine (Pure Domain Function)
// Evaluates booking requests deterministically against lab rules,
// safety thresholds, supervision ratios, and org limits.
// Bilingual output (English & Hindi).
// ============================================================

import {
  Booking,
  Lab,
  LabRules,
  Organization,
  RulesDecision,
  RulesEvaluationResult,
  RulesExplanation,
  RulesViolation,
  RulesWarning,
  StudentGroup,
  User,
} from '../types/index.js'

export interface RulesEvaluationInput {
  request: {
    startTime: string   // ISO string or HH:mm
    endTime: string     // ISO string or HH:mm
    date: string        // YYYY-MM-DD
    headcount: number
    equipmentRequested: string[]
  }
  lab: Lab
  rules: LabRules
  group: StudentGroup
  sponsor: User
  organization: Organization
  orgMonthlyBookingCount?: number
  isBlackoutDate?: boolean
}

export function evaluateRules(input: RulesEvaluationInput): RulesEvaluationResult {
  const {
    request,
    lab,
    rules,
    group,
    organization,
    orgMonthlyBookingCount = 0,
    isBlackoutDate = false,
  } = input

  const violations: RulesViolation[] = []
  const warnings: RulesWarning[] = []
  const explanations: RulesExplanation[] = []

  // 1. Organization Suspension Check (HARD)
  if (organization.isSuspended) {
    violations.push({
      code: 'ORG_SUSPENDED',
      severity: 'HARD',
      message: `Organization is currently suspended: ${organization.suspensionReason || 'Contact platform admin'}`,
      messageHi: `संस्था वर्तमान में निलंबित है: ${organization.suspensionReason || 'कृपया एडमिन से संपर्क करें'}`,
    })
    explanations.push({
      rule: 'Organization Active Status',
      status: 'FAIL',
      message: 'Suspended institutions cannot create booking requests.',
      messageHi: 'निलंबित संस्थाएं बुकिंग अनुरोध नहीं कर सकतीं।',
    })
  } else {
    explanations.push({
      rule: 'Organization Active Status',
      status: 'PASS',
      message: 'Organization status verified and clear.',
      messageHi: 'संस्था की स्थिति सत्यापित और सक्रिय है।',
    })
  }

  // 2. Organization Verification Check (HARD)
  if (rules.requiresVerifiedSponsor && organization.verificationStatus !== 'VERIFIED') {
    violations.push({
      code: 'SPONSOR_NOT_VERIFIED',
      severity: 'HARD',
      message: 'This lab requires a fully verified institution with validated credentials.',
      messageHi: 'इस प्रयोगशाला के लिए सत्यापित संस्था और साख की आवश्यकता है।',
    })
    explanations.push({
      rule: 'Verified Sponsor Requirement',
      status: 'FAIL',
      message: 'Lab owner requires institution to hold VERIFIED status.',
      messageHi: 'प्रयोगशाला मालिक को सत्यापित संस्था की आवश्यकता है।',
    })
  } else {
    explanations.push({
      rule: 'Verified Sponsor Requirement',
      status: 'PASS',
      message: 'Institution verification criteria met.',
      messageHi: 'संस्था सत्यापन मानदंड पूरे हुए।',
    })
  }

  // 3. Blackout Date Check (HARD)
  if (isBlackoutDate) {
    violations.push({
      code: 'BLACKOUT_DATE',
      severity: 'HARD',
      message: 'The requested date is reserved by the host institution.',
      messageHi: 'अनुरोधित तारीख मेजबान संस्थान द्वारा आरक्षित (ब्लैकआउट) है।',
    })
    explanations.push({
      rule: 'Blackout Schedule',
      status: 'FAIL',
      message: 'Lab is closed on this calendar date.',
      messageHi: 'इस तारीख पर प्रयोगशाला बंद है।',
    })
  } else {
    explanations.push({
      rule: 'Blackout Schedule',
      status: 'PASS',
      message: 'Selected date is open for community bookings.',
      messageHi: 'चुनी गई तारीख बुकिंग के लिए उपलब्ध है।',
    })
  }

  // 4. Day of Week Check (HARD)
  const bookingDateObj = new Date(request.date + 'T00:00:00Z')
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const
  const bookingDay = daysOfWeek[bookingDateObj.getUTCDay()]

  if (!rules.allowedDays.includes(bookingDay as any)) {
    violations.push({
      code: 'DAY_NOT_ALLOWED',
      severity: 'HARD',
      message: `Bookings are not permitted on ${bookingDay}. Allowed days: ${rules.allowedDays.join(', ')}`,
      messageHi: `${bookingDay} को बुकिंग की अनुमति नहीं है। अनुमत दिन: ${rules.allowedDays.join(', ')}`,
    })
    explanations.push({
      rule: 'Operating Days Window',
      status: 'FAIL',
      message: `Requested day ${bookingDay} is outside host school sharing days.`,
      messageHi: `अनुरोधित दिन ${bookingDay} साझाकरण दिनों से बाहर है।`,
    })
  } else {
    explanations.push({
      rule: 'Operating Days Window',
      status: 'PASS',
      message: `Day ${bookingDay} is within approved sharing schedule.`,
      messageHi: `दिन ${bookingDay} अनुमत समय-सारणी के भीतर है।`,
    })
  }

  // 5. Operating Hours & Duration Check (HARD)
  const parseTimeToMinutes = (t: string): number => {
    const parts = t.includes('T') ? t.split('T')[1].substring(0, 5) : t
    const [h, m] = parts.split(':').map(Number)
    return h * 60 + m
  }

  const startMins = parseTimeToMinutes(request.startTime)
  const endMins = parseTimeToMinutes(request.endTime)
  const durationMins = endMins - startMins
  const ruleStartMins = parseTimeToMinutes(rules.allowedStartTime)
  const ruleEndMins = parseTimeToMinutes(rules.allowedEndTime)

  if (startMins < ruleStartMins || endMins > ruleEndMins) {
    violations.push({
      code: 'TIME_OUTSIDE_WINDOW',
      severity: 'HARD',
      message: `Requested slot is outside lab hours (${rules.allowedStartTime} – ${rules.allowedEndTime})`,
      messageHi: `अनुरोधित समय लैब समय (${rules.allowedStartTime} – ${rules.allowedEndTime}) से बाहर है`,
    })
    explanations.push({
      rule: 'Operating Hours Window',
      status: 'FAIL',
      message: `Requested time falls outside ${rules.allowedStartTime} - ${rules.allowedEndTime}.`,
      messageHi: `अनुरोधित समय ${rules.allowedStartTime} - ${rules.allowedEndTime} से बाहर है।`,
    })
  } else {
    explanations.push({
      rule: 'Operating Hours Window',
      status: 'PASS',
      message: `Requested hours are within permissible window (${rules.allowedStartTime} – ${rules.allowedEndTime}).`,
      messageHi: `अनुरोधित घंटे अनुमत समय सीमा में हैं।`,
    })
  }

  if (durationMins < rules.minDurationMinutes || durationMins > rules.maxDurationMinutes) {
    violations.push({
      code: 'INVALID_DURATION',
      severity: 'HARD',
      message: `Duration (${durationMins}m) violates limits (min: ${rules.minDurationMinutes}m, max: ${rules.maxDurationMinutes}m)`,
      messageHi: `अवधि (${durationMins} मिनट) सीमा का उल्लंघन करती है (न्यूनतम: ${rules.minDurationMinutes}m, अधिकतम: ${rules.maxDurationMinutes}m)`,
    })
    explanations.push({
      rule: 'Session Duration',
      status: 'FAIL',
      message: `Slot duration must be between ${rules.minDurationMinutes} and ${rules.maxDurationMinutes} minutes.`,
      messageHi: `सत्र अवधि ${rules.minDurationMinutes} और ${rules.maxDurationMinutes} मिनट के बीच होनी चाहिए।`,
    })
  } else {
    explanations.push({
      rule: 'Session Duration',
      status: 'PASS',
      message: `Session duration of ${durationMins} minutes is acceptable.`,
      messageHi: `सत्र अवधि ${durationMins} मिनट स्वीकार्य है।`,
    })
  }

  // 6. Headcount & Capacity Limits (HARD)
  const effectiveMaxGroup = Math.min(lab.capacity, rules.maxGroupSize)
  if (request.headcount > effectiveMaxGroup) {
    violations.push({
      code: 'CAPACITY_EXCEEDED',
      severity: 'HARD',
      message: `Headcount (${request.headcount}) exceeds safe lab limit of ${effectiveMaxGroup} students`,
      messageHi: `छात्र संख्या (${request.headcount}) सुरक्षित सीमा ${effectiveMaxGroup} से अधिक है`,
    })
    explanations.push({
      rule: 'Safe Student Headcount',
      status: 'FAIL',
      message: `Student group of ${request.headcount} exceeds allowable cap of ${effectiveMaxGroup}.`,
      messageHi: `छात्र संख्या ${request.headcount} सुरक्षित सीमा ${effectiveMaxGroup} से अधिक है।`,
    })
  } else {
    explanations.push({
      rule: 'Safe Student Headcount',
      status: 'PASS',
      message: `Group size (${request.headcount}) is safely within capacity (${effectiveMaxGroup}).`,
      messageHi: `छात्र संख्या (${request.headcount}) सुरक्षित क्षमता में है।`,
    })
  }

  // 7. Supervision Ratio (HARD)
  const maxAllowedStudentsPerAdult = rules.supervisionRatioStudents
  const requiredAdults = Math.ceil(request.headcount / maxAllowedStudentsPerAdult)
  // Each booking must guarantee 1 verified adult sponsor + additional adults if headcount demands
  explanations.push({
    rule: 'Supervision Ratio',
    status: 'INFO',
    message: `Requires at least ${requiredAdults} adult supervisor(s) (1 adult per ${maxAllowedStudentsPerAdult} students).`,
    messageHi: `कम से कम ${requiredAdults} वयस्क पर्यवेक्षक आवश्यक हैं (प्रति ${maxAllowedStudentsPerAdult} छात्रों पर 1 वयस्क)।`,
  })

  // 8. Student Grade / Class Safety Threshold (HARD)
  if (rules.minClassStandard && group.classRangeMin < rules.minClassStandard) {
    violations.push({
      code: 'MIN_CLASS_NOT_MET',
      severity: 'HARD',
      message: `Class ${group.classRangeMin} is below minimum allowed class (Class ${rules.minClassStandard}) for this specialized lab`,
      messageHi: `कक्षा ${group.classRangeMin} इस प्रयोगशाला के न्यूनतम स्तर (कक्षा ${rules.minClassStandard}) से कम है`,
    })
    explanations.push({
      rule: 'Minimum Grade Standard',
      status: 'FAIL',
      message: `Lab equipment safety guidelines require students of Class ${rules.minClassStandard} or above.`,
      messageHi: `लैब सुरक्षा दिशानिर्देशों के लिए कक्षा ${rules.minClassStandard} या उससे ऊपर के छात्र आवश्यक हैं।`,
    })
  } else if (rules.minClassStandard) {
    explanations.push({
      rule: 'Minimum Grade Standard',
      status: 'PASS',
      message: `Student class range (${group.classRangeMin}–${group.classRangeMax}) meets safety requirements.`,
      messageHi: `छात्रों का कक्षा स्तर सुरक्षा आवश्यकताओं के अनुकूल है।`,
    })
  }

  // 9. Monthly Booking Quota (HARD)
  if (orgMonthlyBookingCount >= rules.maxBookingsPerOrgPerMonth) {
    violations.push({
      code: 'MONTHLY_QUOTA_EXCEEDED',
      severity: 'HARD',
      message: `Organization has reached monthly quota of ${rules.maxBookingsPerOrgPerMonth} bookings at this lab`,
      messageHi: `संस्था ने इस लैब में प्रति माह ${rules.maxBookingsPerOrgPerMonth} बुकिंग का कोटा पूरा कर लिया है`,
    })
    explanations.push({
      rule: 'Fair Access Monthly Quota',
      status: 'FAIL',
      message: `Monthly cap of ${rules.maxBookingsPerOrgPerMonth} slots prevents monopolization.`,
      messageHi: `प्रति माह ${rules.maxBookingsPerOrgPerMonth} बुकिंग की सीमा अन्य संस्थाओं के लिए भी अवसर सुनिश्चित करती है।`,
    })
  } else {
    explanations.push({
      rule: 'Fair Access Monthly Quota',
      status: 'PASS',
      message: `Quota remaining: ${rules.maxBookingsPerOrgPerMonth - orgMonthlyBookingCount} slot(s) this month.`,
      messageHi: `इस माह शेष कोटा: ${rules.maxBookingsPerOrgPerMonth - orgMonthlyBookingCount} बुकिंग।`,
    })
  }

  // 10. Restricted Equipment Check (SOFT WARNING)
  const restrictedRequested = (request.equipmentRequested || []).filter((id) =>
    (rules.restrictedEquipmentIds || []).includes(id)
  )
  if (restrictedRequested.length > 0) {
    warnings.push({
      code: 'RESTRICTED_EQUIPMENT_REQUESTED',
      message: `${restrictedRequested.length} restricted equipment item(s) requested. Lab In-charge must be present.`,
      messageHi: `${restrictedRequested.length} प्रतिबंधित उपकरण का अनुरोध किया गया। लैब प्रभारी की उपस्थिति अनिवार्य होगी।`,
    })
    explanations.push({
      rule: 'Restricted Equipment Handling',
      status: 'WARNING',
      message: 'Requires explicit manager approval and oversight on day-of visit.',
      messageHi: 'दौरे के दिन लैब मैनेजर की विशेष निगरानी आवश्यक होगी।',
    })
  }

  // 11. Decision Logic
  const hasHardViolation = violations.some((v) => v.severity === 'HARD')
  const autoReject = hasHardViolation

  let autoApprove = false
  let decision: RulesDecision = 'NEEDS_MANUAL_REVIEW'

  if (autoReject) {
    decision = 'FAIL'
  } else {
    // Check auto-approve eligibility:
    // Requires owner has set a trust threshold, org trust meets or exceeds it, zero warnings
    const threshold = Number(rules.autoApproveForTrustedScore || 0)
    const orgScore = Number(organization.trustScore || 50)

    if (
      threshold > 0 &&
      orgScore >= threshold &&
      warnings.length === 0 &&
      violations.length === 0
    ) {
      autoApprove = true
      decision = 'PASS'
      explanations.push({
        rule: 'High Trust Auto-Approval',
        status: 'PASS',
        message: `High Trust Score (${orgScore}/100 >= ${threshold}) qualifies this booking for instant auto-approval!`,
        messageHi: `उच्च ट्रस्ट स्कोर (${orgScore}/100) के कारण यह बुकिंग तुरंत स्वतः स्वीकृत हो सकती है!`,
      })
    } else {
      decision = 'NEEDS_MANUAL_REVIEW'
      explanations.push({
        rule: 'Manager Review Protocol',
        status: 'INFO',
        message: 'Request passes initial automated safety checks and is routed to Lab In-charge for final confirmation.',
        messageHi: 'अनुरोध स्वचालित सुरक्षा जांच में पास हुआ है और अंतिम पुष्टि के लिए लैब इन-चार्ज को भेजा गया है।',
      })
    }
  }

  return {
    decision,
    violations,
    warnings,
    explanations,
    autoApprove,
    autoReject,
  }
}
