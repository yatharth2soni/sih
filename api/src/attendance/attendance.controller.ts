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
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(
    @Body() dto: CheckInDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.attendanceService.checkIn(dto, user);
    return { data };
  }

  @Post(':id/check-out')
  async checkOut(
    @Param('id') id: string,
    @Body() dto: CheckOutDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.attendanceService.checkOut(id, dto, user);
    return { data };
  }

  @Get()
  async getAttendanceRecords(
    @Query() query: QueryAttendanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.attendanceService.getAttendanceRecords(query, user);
  }

  @Get('summary')
  async getAttendanceSummary(
    @Query() query: AttendanceSummaryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.attendanceService.getAttendanceSummary(query, user);
    return { data };
  }
}
