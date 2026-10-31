import { Module } from '@nestjs/common'
import { DayOfOpsController } from './day-of-ops.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [AuthModule],
  controllers: [DayOfOpsController],
})
export class DayOfOpsModule {}
