import { Module } from '@nestjs/common';
import { RequirementsController } from './requirements.controller';
import { RecordsController } from './records.controller';
import { ComplianceService } from './compliance.service';

@Module({
  controllers: [RequirementsController, RecordsController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
