import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Health & Observability')
@Controller()
export class HealthController {
  constructor(private readonly db: InMemoryDbService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  health() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  ready() {
    return {
      status: 'READY',
      storage: 'IN_MEMORY_PRELOADED',
      organizations: this.db.organizations.length,
      labs: this.db.labs.length,
      timestamp: new Date().toISOString(),
    }
  }
}
