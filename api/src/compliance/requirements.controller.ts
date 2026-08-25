import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { QueryRequirementsDto } from './dto/query-requirements.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('compliance/requirements')
@UseGuards(JwtAuthGuard)
export class RequirementsController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  async findAll(@Query() query: QueryRequirementsDto) {
    return this.complianceService.findAllRequirements(query);
  }
}
