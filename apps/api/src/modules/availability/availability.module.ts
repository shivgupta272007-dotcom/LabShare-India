import { Module } from '@nestjs/common'
import { AvailabilityController } from './availability.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [AuthModule],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
