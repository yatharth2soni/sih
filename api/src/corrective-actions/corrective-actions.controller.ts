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
import { CorrectiveActionsService } from './corrective-actions.service';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaDto } from './dto/update-capa.dto';
import { CloseCapaDto } from './dto/close-capa.dto';
import { QueryCapasDto } from './dto/query-capas.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CorrectiveActionsController {
  constructor(
    private readonly correctiveActionsService: CorrectiveActionsService,
  ) {}

  @Post('violations/:violationId/corrective-actions')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('violationId') violationId: string,
    @Body() dto: CreateCapaDto,
    @CurrentUser() user: RequestUser,
  ) {
    const capa = await this.correctiveActionsService.create(
      violationId,
      dto,
      user,
    );
    return { data: capa };
  }

  @Get('corrective-actions')
  async findAll(
    @Query() query: QueryCapasDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.correctiveActionsService.findAll(query, user);
  }

  @Get('corrective-actions/:id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const capa = await this.correctiveActionsService.findOne(id, user);
    return { data: capa };
  }

  @Patch('corrective-actions/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCapaDto,
    @CurrentUser() user: RequestUser,
  ) {
    const capa = await this.correctiveActionsService.update(id, dto, user);
    return { data: capa };
  }

  @Post('corrective-actions/:id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const capa = await this.correctiveActionsService.start(id, user);
    return { data: capa };
  }

  @Post('corrective-actions/:id/close')
  @HttpCode(HttpStatus.OK)
  async close(
    @Param('id') id: string,
    @Body() dto: CloseCapaDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.correctiveActionsService.close(id, dto, user);
  }
}
