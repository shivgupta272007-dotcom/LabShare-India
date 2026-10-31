// ============================================================
// LabShare – Labs Controller
// ============================================================

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { LabsService } from './labs.service.js'
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { RbacGuard } from '../../common/guards/rbac.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'

@ApiTags('Labs & Discovery')
@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Search and discover participating school labs with distance calculation' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'minCapacity', required: false, type: Number })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  async searchLabs(
    @Query('type') type?: string,
    @Query('district') district?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('query') queryText?: string,
    @Query('minCapacity') minCapacity?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('sortBy') sortBy?: any
  ) {
    return this.labsService.searchLabs({
      type,
      district,
      state,
      city,
      query: queryText,
      minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
      sortBy,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed lab information including rules, equipment, and trust score' })
  async getLabById(@Param('id') id: string) {
    return this.labsService.getLabById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Roles('OWNER_SCHOOL', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lab listing (Owner school)' })
  async createLab(
    @Body() body: any,
    @CurrentUser('orgId') orgId: string
  ) {
    return this.labsService.createLab(body, orgId)
  }

  @Post(':id/rules')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Roles('OWNER_SCHOOL', 'MANAGER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set or update lab booking rules (Versioned)' })
  async saveRules(
    @Param('id') labId: string,
    @Body() body: any,
    @CurrentUser('userId') userId: string,
    @CurrentUser('orgId') orgId: string
  ) {
    return this.labsService.saveLabRules(labId, body, userId, orgId)
  }
}
