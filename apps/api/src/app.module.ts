// ============================================================
// LabShare – Root Application Module
// Assembles all functional domain modules and global providers
// ============================================================

import { Module } from '@nestjs/common'
import { StorageModule } from './storage/storage.module.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { LabsModule } from './modules/labs/labs.module.js'
import { AvailabilityModule } from './modules/availability/availability.module.js'
import { BookingsModule } from './modules/bookings/bookings.module.js'
import { DayOfOpsModule } from './modules/day-of-ops/day-of-ops.module.js'
import { AdminModule } from './modules/admin/admin.module.js'
import { AnalyticsModule } from './modules/analytics/analytics.module.js'
import { NotificationsModule } from './modules/notifications/notifications.module.js'
import { OrganizationsModule } from './modules/organizations/organizations.module.js'
import { ReviewsModule } from './modules/reviews/reviews.module.js'
import { HealthModule } from './modules/health/health.module.js'

@Module({
  imports: [
    StorageModule,
    AuthModule,
    LabsModule,
    AvailabilityModule,
    BookingsModule,
    DayOfOpsModule,
    AdminModule,
    AnalyticsModule,
    NotificationsModule,
    OrganizationsModule,
    ReviewsModule,
    HealthModule,
  ],
})
export class AppModule {}
