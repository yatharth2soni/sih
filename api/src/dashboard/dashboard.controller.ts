import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('mine/:mineId/overview')
  async getMineOverview(
    @Param('mineId') mineId: string,
    @Query() query: QueryDashboardDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.dashboardService.getMineOverview(mineId, query, user);
    return { data };
  }

  @Get('company/:companyId/overview')
  async getCompanyOverview(
    @Param('companyId') companyId: string,
    @Query() query: QueryDashboardDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.dashboardService.getCompanyOverview(
      companyId,
      query,
      user,
    );
    return { data };
  }

  @Get('regulator/overview')
  async getRegulatorOverview(
    @Query() query: QueryDashboardDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.dashboardService.getRegulatorOverview(query, user);
    return { data };
  }
}
