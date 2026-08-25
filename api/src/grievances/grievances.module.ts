import { Module } from '@nestjs/common';
import { GrievancesController } from './grievances.controller';
import { GrievancesService } from './grievances.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [GrievancesController],
  providers: [GrievancesService, ScopeService],
  exports: [GrievancesService],
})
export class GrievancesModule {}
