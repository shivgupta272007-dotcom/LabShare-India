import { Module } from '@nestjs/common'
import { LabsController } from './labs.controller.js'
import { LabsService } from './labs.service.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [AuthModule],
  controllers: [LabsController],
  providers: [LabsService],
  exports: [LabsService],
})
export class LabsModule {}
