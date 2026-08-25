import { Module, Global } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { ScopeService } from '../common/services/scope.service';

@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService, ScopeService],
  exports: [AuditService],
})
export class AuditModule {}
