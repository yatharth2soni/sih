import { Module } from '@nestjs/common';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [InspectionsController],
  providers: [InspectionsService, ScopeService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
