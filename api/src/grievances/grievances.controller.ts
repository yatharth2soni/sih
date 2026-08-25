import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { GrievancesService } from './grievances.service';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { QueryGrievancesDto } from './dto/query-grievances.dto';
import { CreateGrievanceCommentDto } from './dto/create-comment.dto';
import { AssignGrievanceDto } from './dto/assign-grievance.dto';
import { EscalateGrievanceDto } from './dto/escalate-grievance.dto';
import {
  ResolveGrievanceDto,
  ReopenGrievanceDto,
  CloseGrievanceDto,
} from './dto/resolve-grievance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('grievances')
@UseGuards(JwtAuthGuard)
export class GrievancesController {
  constructor(private readonly grievancesService: GrievancesService) {}

  @Post()
  async createGrievance(
    @Body() dto: CreateGrievanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.createGrievance(dto, user);
    return { data };
  }

  @Get()
  async getGrievances(
    @Query() query: QueryGrievancesDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.grievancesService.getGrievances(query, user);
  }

  @Get(':id')
  async getGrievance(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.getGrievance(id, user);
    return { data };
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateGrievanceCommentDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.addComment(id, dto, user);
    return { data };
  }

  @Post(':id/assign')
  async assignGrievance(
    @Param('id') id: string,
    @Body() dto: AssignGrievanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.assignGrievance(id, dto, user);
    return { data };
  }

  @Post(':id/start')
  async startTriage(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.startTriage(id, user);
    return { data };
  }

  @Post(':id/escalate')
  async escalateGrievance(
    @Param('id') id: string,
    @Body() dto: EscalateGrievanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.escalateGrievance(id, dto, user);
    return { data };
  }

  @Post(':id/resolve')
  async resolveGrievance(
    @Param('id') id: string,
    @Body() dto: ResolveGrievanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.resolveGrievance(id, dto, user);
    return { data };
  }

  @Post(':id/close')
  async closeGrievance(
    @Param('id') id: string,
    @Body() dto: CloseGrievanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.closeGrievance(id, dto, user);
    return { data };
  }

  @Post(':id/reopen')
  async reopenGrievance(
    @Param('id') id: string,
    @Body() dto: ReopenGrievanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.grievancesService.reopenGrievance(id, dto, user);
    return { data };
  }
}
