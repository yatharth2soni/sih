import { Module } from '@nestjs/common';
import { ContractorsController } from './contractors.controller';
import { ContractorContractsController } from './contractor-contracts.controller';
import { ContractorsService } from './contractors.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [ContractorsController, ContractorContractsController],
  providers: [ContractorsService, ScopeService],
  exports: [ContractorsService],
})
export class ContractorsModule {}
