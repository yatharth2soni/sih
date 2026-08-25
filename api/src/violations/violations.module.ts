import { Module } from '@nestjs/common';
import { ViolationsController } from './violations.controller';
import { ViolationsService } from './violations.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [ViolationsController],
  providers: [ViolationsService, ScopeService],
  exports: [ViolationsService],
})
export class ViolationsModule {}
