import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ScopeService],
  exports: [ReportsService],
})
export class ReportsModule {}
