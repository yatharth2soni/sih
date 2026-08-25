import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';
import { QueryWorkersDto } from './dto/query-workers.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('workers')
@UseGuards(JwtAuthGuard)
export class WorkersController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async createWorker(
    @Body() dto: CreateWorkerProfileDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.attendanceService.createWorkerProfile(dto, user);
    return { data };
  }

  @Get()
  async getWorkers(
    @Query() query: QueryWorkersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.attendanceService.getWorkers(query, user);
  }

  @Get(':id')
  async getWorker(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.attendanceService.getWorker(id, user);
    return { data };
  }
}
