import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const company = await this.companiesService.findOne(id);
    return { data: company };
  }

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    const company = await this.companiesService.create(dto);
    return { data: company };
  }
}
