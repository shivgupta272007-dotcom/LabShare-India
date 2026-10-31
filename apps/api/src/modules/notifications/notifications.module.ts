import { Module } from '@nestjs/common'
import { NotificationsController } from './notifications.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
