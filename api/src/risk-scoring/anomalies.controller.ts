import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RiskScoringService } from './risk-scoring.service';
import { QueryAnomaliesDto } from './dto/query-anomalies.dto';
import {
  AcknowledgeAnomalyDto,
  ResolveAnomalyDto,
  DismissAnomalyDto,
} from './dto/action-anomaly.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('anomalies')
@UseGuards(JwtAuthGuard)
export class AnomaliesController {
  constructor(private readonly riskScoringService: RiskScoringService) {}

  @Get()
  async getAnomalies(
    @Query() query: QueryAnomaliesDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.riskScoringService.getAnomalies(query, user);
  }

  @Post(':id/acknowledge')
  async acknowledgeAnomaly(
    @Param('id') id: string,
    @Body() dto: AcknowledgeAnomalyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.riskScoringService.acknowledgeAnomaly(
      id,
      dto.reason,
      user,
    );
    return { data };
  }

  @Post(':id/resolve')
  async resolveAnomaly(
    @Param('id') id: string,
    @Body() dto: ResolveAnomalyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.riskScoringService.resolveAnomaly(
      id,
      dto.reason,
      user,
    );
    return { data };
  }

  @Post(':id/dismiss')
  async dismissAnomaly(
    @Param('id') id: string,
    @Body() dto: DismissAnomalyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.riskScoringService.dismissAnomaly(
      id,
      dto.reason,
      user,
    );
    return { data };
  }
}
