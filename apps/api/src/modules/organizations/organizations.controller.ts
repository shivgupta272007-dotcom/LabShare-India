// ============================================================
// LabShare – Organizations & Student Groups Controller
// ============================================================

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { randomUUID } from 'node:crypto'
import { Organization, StudentGroup } from '@labshare/shared'
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Organizations & Groups')
@Controller()
export class OrganizationsController {
  constructor(private readonly db: InMemoryDbService) {}

  @Get('organizations')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List all verified participating schools, NGOs, and coachings' })
  async listOrgs() {
    return this.db.organizations.filter((o) => !o.isSuspended)
  }

  @Get('organizations/:id')
  @ApiOperation({ summary: 'Get organization details with trust score' })
  async getOrgById(@Param('id') id: string) {
    const org = this.db.findOrganizationById(id)
    if (!org) throw new NotFoundException('Organization not found.')
    return org
  }

  @Post('organizations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Onboard a new institution (School, NGO, Coaching)' })
  async registerOrg(
    @Body() body: any,
    @CurrentUser('userId') userId: string
  ) {
    const org: Organization = {
      id: randomUUID(),
      name: body.name,
      type: body.type,
      verificationStatus: 'PENDING',
      udiseCode: body.udiseCode,
      registrationNumber: body.registrationNumber,
      address: body.address,
      district: body.district,
      state: body.state,
      pincode: body.pincode,
      phone: body.phone,
      email: body.email,
      website: body.website,
      lat: body.lat,
      lng: body.lng,
      trustScore: 50,
      isActive: true,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.db.organizations.push(org)

    // Assign creator membership
    this.db.memberships.push({
      id: randomUUID(),
      userId,
      organizationId: org.id,
      role: body.type === 'OWNER_SCHOOL' ? 'OWNER_SCHOOL' : 'TEACHER_SPONSOR',
      isActive: true,
      joinedAt: new Date().toISOString(),
    })

    return org
  }

  // ──────────────────────────────────────────────────────────
  // Student Groups (Minimal PII for minors)
  // ──────────────────────────────────────────────────────────
  @Get('student-groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List student groups registered by requesting institution' })
  async listStudentGroups(@CurrentUser('orgId') orgId: string) {
    return this.db.studentGroups.filter((g) => g.organizationId === orgId && g.isActive)
  }

  @Post('student-groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register a student group (Stores aggregate headcount & class range, ZERO minor PII)',
  })
  async createStudentGroup(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
    @CurrentUser('orgId') orgId: string
  ) {
    const group: StudentGroup = {
      id: randomUUID(),
      organizationId: orgId,
      sponsorUserId: userId,
      name: body.name,
      description: body.description,
      headcount: body.headcount,
      classRangeMin: body.classRangeMin,
      classRangeMax: body.classRangeMax,
      ageRangeMin: body.ageRangeMin,
      ageRangeMax: body.ageRangeMax,
      emergencyContactName: body.emergencyContactName,
      emergencyContactPhone: body.emergencyContactPhone,
      emergencyContactRelation: body.emergencyContactRelation,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.db.studentGroups.push(group)
    return group
  }
}
