import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { WorkersController } from './workers.controller';
import { AttendanceService } from './attendance.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [AttendanceController, WorkersController],
  providers: [AttendanceService, ScopeService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
