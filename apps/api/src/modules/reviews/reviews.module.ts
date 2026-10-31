import { Module } from '@nestjs/common'
import { ReviewsController } from './reviews.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
