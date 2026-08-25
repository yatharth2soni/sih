import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { QueryInspectionsDto } from './dto/query-inspections.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('inspections')
@UseGuards(JwtAuthGuard)
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async schedule(
    @Body() dto: ScheduleInspectionDto,
    @CurrentUser() user: RequestUser,
  ) {
    const inspection = await this.inspectionsService.schedule(dto, user);
    return { data: inspection };
  }

  @Get()
  async findAll(
    @Query() query: QueryInspectionsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.inspectionsService.findAll(query, user);
  }

  @Get('templates')
  async getTemplates(@Query('companyId') companyId?: string) {
    const templates = await this.inspectionsService.getTemplates(companyId);
    return { data: templates };
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: RequestUser,
  ) {
    const template = await this.inspectionsService.createTemplate(dto, user);
    return { data: template };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.inspectionsService.findOne(id, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInspectionDto,
    @CurrentUser() user: RequestUser,
  ) {
    const inspection = await this.inspectionsService.update(id, dto, user);
    return { data: inspection };
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const inspection = await this.inspectionsService.start(id, user);
    return { data: inspection };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
    @Body('summary') summary: string | undefined,
    @CurrentUser() user: RequestUser,
  ) {
    return this.inspectionsService.complete(id, user, summary);
  }
}
