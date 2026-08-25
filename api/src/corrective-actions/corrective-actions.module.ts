import { Module } from '@nestjs/common';
import { CorrectiveActionsController } from './corrective-actions.controller';
import { CorrectiveActionsService } from './corrective-actions.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [CorrectiveActionsController],
  providers: [CorrectiveActionsService, ScopeService],
  exports: [CorrectiveActionsService],
})
export class CorrectiveActionsModule {}
