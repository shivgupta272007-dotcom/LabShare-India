// ============================================================
// LabShare – Fully Typed Universal API Client
// Handles authentication headers, error serialization, SSE streams
// ============================================================

import {
  Booking,
  DayOfWeek,
  ImpactMetrics,
  Lab,
  LabRules,
  Notification,
  Organization,
  RulesEvaluationResult,
  StudentGroup,
  TrustScore,
  User,
  UserRole,
} from '../types/index.js'
import {
  BookingActionInput,
  CreateBookingInput,
  CreateLabInput,
  CreateStudentGroupInput,
  SponsorVouchInput,
} from '../schemas/index.js'

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = 'http://localhost:3001/api/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const res = await fetch(url, { ...options, headers })

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`
      try {
        const body: any = await res.json()
        errorMsg = body.error?.message || body.message || errorMsg
      } catch {
        // fallback
      }
      throw new Error(errorMsg)
    }

    return (await res.json()) as T
  }

  // ──────────────────────────────────────────────────────────
  // Auth
  // ──────────────────────────────────────────────────────────
  auth = {
    sendOtp: (phone: string) =>
      this.request<{ success: boolean; message: string; demoOtp?: string }>('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),

    verifyOtp: (phone: string, otp: string) =>
      this.request<{
        accessToken: string
        refreshToken: string
        user: User
        memberships: any[]
      }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      }),

    switchDemoRole: (role: UserRole) =>
      this.request<{
        accessToken: string
        user: User
        activeRole: UserRole
      }>('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),

    getMe: () =>
      this.request<{
        user: User
        memberships: any[]
        activeMembership: any
      }>('/auth/me'),
  }

  // ──────────────────────────────────────────────────────────
  // Labs & Availability
  // ──────────────────────────────────────────────────────────
  labs = {
    search: (params: {
      type?: string
      district?: string
      minCapacity?: number
      lat?: number
      lng?: number
      radiusKm?: number
      sortBy?: string
    }) => {
      const q = new URLSearchParams()
      if (params.type) q.set('type', params.type)
      if (params.district) q.set('district', params.district)
      if (params.minCapacity) q.set('minCapacity', params.minCapacity.toString())
      if (params.lat) q.set('lat', params.lat.toString())
      if (params.lng) q.set('lng', params.lng.toString())
      if (params.radiusKm) q.set('radiusKm', params.radiusKm.toString())
      if (params.sortBy) q.set('sortBy', params.sortBy)
      return this.request<Array<Lab & { distanceKm?: number }>>(`/labs?${q.toString()}`)
    },

    getById: (id: string) => this.request<Lab>(`/labs/${id}`),

    create: (input: CreateLabInput) =>
      this.request<Lab>('/labs', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    saveRules: (labId: string, rules: any) =>
      this.request<LabRules>(`/labs/${labId}/rules`, {
        method: 'POST',
        body: JSON.stringify(rules),
      }),

    getAvailability: (labId: string, date: string) =>
      this.request<any>(`/labs/${labId}/availability?date=${date}`),

    getReviews: (labId: string) => this.request<any[]>(`/labs/${labId}/reviews`),
  }

  // ──────────────────────────────────────────────────────────
  // Rules Engine
  // ──────────────────────────────────────────────────────────
  rules = {
    evaluate: (input: {
      labId: string
      studentGroupId?: string
      date: string
      startTime: string
      endTime: string
      headcount: number
      equipmentRequested: string[]
      orgId?: string
    }) =>
      this.request<RulesEvaluationResult>('/rules/evaluate', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  }

  // ──────────────────────────────────────────────────────────
  // Bookings
  // ──────────────────────────────────────────────────────────
  bookings = {
    create: (input: CreateBookingInput, idempotencyKey?: string) =>
      this.request<Booking>('/bookings', {
        method: 'POST',
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
        body: JSON.stringify(input),
      }),

    list: () => this.request<Booking[]>('/bookings'),

    getById: (id: string) => this.request<Booking>(`/bookings/${id}`),

    action: (id: string, actionInput: BookingActionInput) =>
      this.request<Booking>(`/bookings/${id}/action`, {
        method: 'POST',
        body: JSON.stringify(actionInput),
      }),

    submitVouch: (bookingId: string, vouchInput: Omit<SponsorVouchInput, 'bookingId'>) =>
      this.request<any>(`/bookings/${bookingId}/vouch`, {
        method: 'POST',
        body: JSON.stringify(vouchInput),
      }),
  }

  // ──────────────────────────────────────────────────────────
  // Day-of Operations
  // ──────────────────────────────────────────────────────────
  ops = {
    getTodaySchedule: () => this.request<any>('/ops/today'),

    checkIn: (data: {
      bookingId: string
      code: string
      actualHeadcount: number
      supervisingAdultName: string
      supervisingAdultPhone: string
    }) =>
      this.request<any>('/ops/check-in', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    checkOut: (data: {
      bookingId: string
      damageFlagged: boolean
      damageNotes?: string
    }) =>
      this.request<any>('/ops/check-out', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    reportIncident: (data: {
      bookingId: string
      severity: string
      title: string
      description: string
    }) =>
      this.request<any>('/ops/incident', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  }

  // ──────────────────────────────────────────────────────────
  // Admin & Compliance
  // ──────────────────────────────────────────────────────────
  admin = {
    getAuditLogs: (params?: { action?: string; entityType?: string }) => {
      const q = new URLSearchParams()
      if (params?.action) q.set('action', params.action)
      if (params?.entityType) q.set('entityType', params.entityType)
      return this.request<any[]>(`/admin/audit?${q.toString()}`)
    },

    verifyChain: () => this.request<any>('/admin/audit/verify'),

    getPendingOrgs: () => this.request<Organization[]>('/admin/organizations/pending'),

    verifyOrg: (id: string, status: 'VERIFIED' | 'REJECTED', reason?: string) =>
      this.request<any>(`/admin/organizations/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status, reason }),
      }),

    suspendOrg: (id: string, reason: string) =>
      this.request<any>(`/admin/organizations/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    getDisputes: () => this.request<any[]>('/admin/disputes'),

    resolveDispute: (id: string, resolution: string, adminNote?: string) =>
      this.request<any>(`/admin/disputes/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution, adminNote }),
      }),
  }

  // ──────────────────────────────────────────────────────────
  // Analytics
  // ──────────────────────────────────────────────────────────
  analytics = {
    getImpact: () => this.request<ImpactMetrics>('/analytics/impact'),
    getDistrictHeatmap: () => this.request<any[]>('/analytics/districts'),
    getTrustScore: (orgId: string) => this.request<TrustScore>(`/analytics/trust-score/${orgId}`),
  }

  // ──────────────────────────────────────────────────────────
  // Notifications
  // ──────────────────────────────────────────────────────────
  notifications = {
    list: () => this.request<Notification[]>('/notifications'),
    markAsRead: (id: string) => this.request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  }

  // ──────────────────────────────────────────────────────────
  // Organizations & Groups
  // ──────────────────────────────────────────────────────────
  orgs = {
    list: () => this.request<Organization[]>('/organizations'),
    getById: (id: string) => this.request<Organization>(`/organizations/${id}`),
    register: (data: any) =>
      this.request<Organization>('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listStudentGroups: () => this.request<StudentGroup[]>('/student-groups'),
    createStudentGroup: (data: any) =>
      this.request<StudentGroup>('/student-groups', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  }

  // ──────────────────────────────────────────────────────────
  // Reviews
  // ──────────────────────────────────────────────────────────
  reviews = {
    create: (data: { bookingId: string; rating: number; comment?: string }) =>
      this.request<any>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  }
}

export const createApiClient = (baseUrl?: string) => new ApiClient(baseUrl)
