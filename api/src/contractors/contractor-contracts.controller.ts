import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { AssignWorkerDto, UnassignWorkerDto } from './dto/assign-worker.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ContractorContractsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Post('contractors/:id/contracts')
  async createContract(
    @Param('id') contractorId: string,
    @Body() dto: CreateContractDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.createContract(
      contractorId,
      dto,
      user,
    );
    return { data };
  }

  @Get('contractor-contracts')
  async getContracts(
    @Query() query: QueryContractsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.contractorsService.getContracts(query, user);
  }

  @Get('contractor-contracts/:id')
  async getContract(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.getContract(id, user);
    return { data };
  }

  @Patch('contractor-contracts/:id')
  async updateContract(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.updateContract(id, dto, user);
    return { data };
  }

  @Post('contractor-contracts/:id/terminate')
  async terminateContract(
    @Param('id') id: string,
    @Body() dto: TerminateContractDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.terminateContract(
      id,
      dto,
      user,
    );
    return { data };
  }

  @Post('contractor-contracts/:id/workers/assign')
  async assignWorker(
    @Param('id') contractId: string,
    @Body() dto: AssignWorkerDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.assignWorkerToContract(
      contractId,
      dto,
      user,
    );
    return { data };
  }

  @Post('contractor-contracts/:id/workers/unassign')
  async unassignWorker(
    @Param('id') contractId: string,
    @Body() dto: UnassignWorkerDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.unassignWorkerFromContract(
      contractId,
      dto,
      user,
    );
    return { data };
  }
}
