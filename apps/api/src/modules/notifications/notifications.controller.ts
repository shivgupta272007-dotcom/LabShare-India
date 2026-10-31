// ============================================================
// LabShare – Realtime Notifications & SSE Controller
// ============================================================

import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Realtime Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly db: InMemoryDbService) {}

  @Get()
  @ApiOperation({ summary: 'Get in-app notification inbox for authenticated user' })
  async getNotifications(@CurrentUser('userId') userId: string) {
    return this.db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    const notif = this.db.notifications.find((n) => n.id === id)
    if (notif) {
      notif.isRead = true
      notif.readAt = new Date().toISOString()
    }
    return { success: true }
  }

  @Get('stream')
  @ApiOperation({ summary: 'Real-time Server-Sent Events (SSE) stream for manager notifications' })
  streamNotifications(@CurrentUser('userId') userId: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`)

    // Heartbeat ping every 15s to keep connection open through reverse proxies
    const heartbeat = setInterval(() => {
      res.write(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`)
    }, 15000)

    reqCloseHandler:
    res.on('close', () => {
      clearInterval(heartbeat)
    })
  }
}
