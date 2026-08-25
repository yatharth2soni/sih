import { Module } from '@nestjs/common';
import { ObservationsController } from './observations.controller';
import { ObservationsService } from './observations.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [ObservationsController],
  providers: [ObservationsService, ScopeService],
  exports: [ObservationsService],
})
export class ObservationsModule {}
