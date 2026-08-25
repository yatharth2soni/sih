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
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import { QueryContractorsDto } from './dto/query-contractors.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Post('contractors')
  async createContractor(
    @Body() dto: CreateContractorDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.createContractor(dto, user);
    return { data };
  }

  @Get('contractors')
  async getContractors(
    @Query() query: QueryContractorsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.contractorsService.getContractors(query, user);
  }

  @Get('contractors/:id')
  async getContractor(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.getContractor(id, user);
    return { data };
  }

  @Patch('contractors/:id')
  async updateContractor(
    @Param('id') id: string,
    @Body() dto: UpdateContractorDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.updateContractor(id, dto, user);
    return { data };
  }

  @Get('mines/:mineId/contractors')
  async getMineActiveContractors(
    @Param('mineId') mineId: string,
    @Query('asOf') asOf: string | undefined,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.getMineActiveContractors(
      mineId,
      asOf,
      user,
    );
    return { data };
  }

  @Post('contractors/:id/workers')
  async createWorker(
    @Param('id') contractorId: string,
    @Body() dto: CreateWorkerDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.createWorker(
      contractorId,
      dto,
      user,
    );
    return { data };
  }

  @Get('contractors/:id/workers')
  async getWorkers(
    @Param('id') contractorId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.getWorkers(contractorId, user);
    return { data };
  }

  @Patch('contractor-workers/:workerId')
  async updateWorker(
    @Param('workerId') workerId: string,
    @Body() dto: UpdateWorkerDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.contractorsService.updateWorker(
      workerId,
      dto,
      user,
    );
    return { data };
  }
}
