import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { QueryRecordsDto } from './dto/query-records.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('mines/:mineId/compliance/records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  async findByMine(
    @Param('mineId') mineId: string,
    @Query() query: QueryRecordsDto,
  ) {
    return this.complianceService.findRecordsByMine(mineId, query);
  }

  @Patch(':recordId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MINE_OFFICIAL, UserRole.CORPORATE)
  async updateRecord(
    @Param('mineId') mineId: string,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateRecordDto,
  ) {
    const record = await this.complianceService.updateRecord(
      mineId,
      recordId,
      dto,
    );
    return { data: record };
  }
}
