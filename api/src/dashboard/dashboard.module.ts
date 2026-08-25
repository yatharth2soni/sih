import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, ScopeService],
  exports: [DashboardService],
})
export class DashboardModule {}
