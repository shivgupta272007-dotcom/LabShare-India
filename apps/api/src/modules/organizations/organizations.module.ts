import { Module } from '@nestjs/common'
import { OrganizationsController } from './organizations.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [AuthModule],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
