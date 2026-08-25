import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EscalationService } from './escalation.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { QueryEscalationsDto } from './dto/query-escalations.dto';
import { TriggerScanDto } from './dto/trigger-scan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(
    private readonly escalationService: EscalationService,
    private readonly schedulerService: NotificationSchedulerService,
  ) {}

  @Get('escalations')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR)
  async getEscalations(@Query() query: QueryEscalationsDto) {
    return this.escalationService.queryEscalations(query);
  }

  @Post('trigger-scan')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async triggerScan(@Body() dto?: TriggerScanDto) {
    const clock = dto?.now ? new Date(dto.now) : new Date();
    const result = await this.schedulerService.scanAndEscalate(clock);
    return {
      message: 'Scheduled reminder and escalation scan completed successfully',
      data: result,
    };
  }
}
