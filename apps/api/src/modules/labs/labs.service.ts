// ============================================================
// LabShare – Labs & Discovery Service
// Geo-search (Haversine), ranking by distance + trust + rating,
// rule versioning, and lab management.
// ============================================================

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { CreateLabInput, Lab, LabRules, UserRole } from '@labshare/shared'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

@Injectable()
export class LabsService {
  constructor(private readonly db: InMemoryDbService) {}

  /**
   * Search labs with filters, geo-distance computation, and multi-factor ranking
   */
  async searchLabs(params: {
    type?: string
    district?: string
    minCapacity?: number
    lat?: number
    lng?: number
    radiusKm?: number
    sortBy?: 'distance' | 'trust' | 'rating' | 'name'
  }): Promise<Array<Lab & { distanceKm?: number }>> {
    let results = this.db.findLabs(params)

    // Calculate distance if lat/lng provided
    const withDistance = results.map((lab) => {
      let distanceKm: number | undefined
      if (params.lat && params.lng && lab.lat && lab.lng) {
        distanceKm = haversineDistanceKm(params.lat, params.lng, lab.lat, lab.lng)
      } else if (params.lat && params.lng && lab.organization?.lat && lab.organization?.lng) {
        distanceKm = haversineDistanceKm(
          params.lat,
          params.lng,
          lab.organization.lat,
          lab.organization.lng
        )
      }
      return { ...lab, distanceKm }
    })

    // Filter by radius if provided
    let filtered = withDistance
    if (params.radiusKm && params.lat && params.lng) {
      filtered = withDistance.filter((l) => l.distanceKm !== undefined && l.distanceKm <= params.radiusKm!)
    }

    // Sort
    const sortBy = params.sortBy || 'distance'
    filtered.sort((a, b) => {
      if (sortBy === 'distance' && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm
      }
      if (sortBy === 'trust') {
        return (b.trustScore || 0) - (a.trustScore || 0)
      }
      if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0)
      }
      return a.name.localeCompare(b.name)
    })

    return filtered
  }

  /**
   * Find single lab by ID
   */
  async getLabById(id: string): Promise<Lab> {
    const lab = this.db.findLabById(id)
    if (!lab) {
      throw new NotFoundException(`Lab with ID ${id} not found.`)
    }
    return lab
  }

  /**
   * Create new lab
   */
  async createLab(input: CreateLabInput, orgId: string): Promise<Lab> {
    const org = this.db.findOrganizationById(orgId)
    if (!org) {
      throw new BadRequestException('Organization not found.')
    }

    const lab: Lab = {
      id: randomUUID(),
      organizationId: orgId,
      name: input.name,
      type: input.type,
      description: input.description,
      capacity: input.capacity,
      areasqft: input.areasqft,
      floor: input.floor,
      buildingName: input.buildingName,
      lat: input.lat || org.lat,
      lng: input.lng || org.lng,
      isActive: true,
      isAccessible: input.isAccessible,
      accessibilityNotes: input.accessibilityNotes,
      safetyNotes: input.safetyNotes,
      trustScore: org.trustScore,
      totalBookings: 0,
      totalHoursShared: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.db.labs.push(lab)
    return this.getLabById(lab.id)
  }

  /**
   * Create or update lab rules (Versioned)
   */
  async saveLabRules(labId: string, rulesData: any, userId: string, orgId: string): Promise<LabRules> {
    const lab = await this.getLabById(labId)
    if (lab.organizationId !== orgId) {
      throw new ForbiddenException('IDOR Prevention: Cannot modify rules of another school’s lab.')
    }

    // Deactivate previous rules
    this.db.labRules.forEach((r) => {
      if (r.labId === labId) r.isActive = false
    })

    const existingCount = this.db.labRules.filter((r) => r.labId === labId).length

    const newRules: LabRules = {
      id: randomUUID(),
      labId,
      version: existingCount + 1,
      isActive: true,
      allowedDays: rulesData.allowedDays,
      allowedStartTime: rulesData.allowedStartTime,
      allowedEndTime: rulesData.allowedEndTime,
      holidayOnly: !!rulesData.holidayOnly,
      minDurationMinutes: rulesData.minDurationMinutes || 60,
      maxDurationMinutes: rulesData.maxDurationMinutes || 180,
      advanceNoticeDays: rulesData.advanceNoticeDays ?? 2,
      maxAdvanceBookingDays: rulesData.maxAdvanceBookingDays ?? 30,
      maxGroupSize: rulesData.maxGroupSize || lab.capacity,
      minClassStandard: rulesData.minClassStandard,
      supervisionRatioAdults: rulesData.supervisionRatioAdults || 1,
      supervisionRatioStudents: rulesData.supervisionRatioStudents || 15,
      requiresVerifiedSponsor: rulesData.requiresVerifiedSponsor !== false,
      requiresParentConsent: !!rulesData.requiresParentConsent,
      restrictedEquipmentIds: rulesData.restrictedEquipmentIds || [],
      maxBookingsPerOrgPerMonth: rulesData.maxBookingsPerOrgPerMonth || 4,
      autoApproveForTrustedScore: rulesData.autoApproveForTrustedScore,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    }

    this.db.labRules.push(newRules)
    return newRules
  }
}
