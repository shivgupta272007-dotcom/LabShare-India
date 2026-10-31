// ============================================================
// LabShare – Reviews Controller
// ============================================================

import {
  BadRequestException,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { InMemoryDbService } from '../../storage/in-memory-db.js'

@ApiTags('Reviews & Feedback')
@Controller()
export class ReviewsController {
  constructor(private readonly db: InMemoryDbService) {}

  @Get('labs/:id/reviews')
  @ApiOperation({ summary: 'List public reviews for a specific school lab' })
  async getLabReviews(@Param('id') labId: string) {
    return this.db.reviews
      .filter((r) => r.targetLabId === labId && r.isPublic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit rating and review for a completed booking' })
  async createReview(
    @Body()
    body: {
      bookingId: string
      rating: number
      comment?: string
    },
    @CurrentUser('userId') userId: string,
    @CurrentUser('orgId') orgId: string
  ) {
    const booking = this.db.findBookingById(body.bookingId)
    if (!booking) throw new NotFoundException('Booking not found.')

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Reviews may only be submitted for COMPLETED bookings.')
    }

    const review = {
      id: randomUUID(),
      bookingId: booking.id,
      reviewerUserId: userId,
      reviewerOrgId: orgId,
      targetLabId: booking.labId,
      rating: Math.max(1, Math.min(5, Math.round(body.rating))),
      comment: body.comment,
      isPublic: true,
      createdAt: new Date().toISOString(),
    }

    this.db.reviews.push(review)
    return review
  }
}
