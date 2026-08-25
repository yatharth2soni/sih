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
import { QueryRiskScoresDto } from './dto/query-risk-scores.dto';
import { RecalculateRiskDto } from './dto/recalculate-risk.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';
import { UserRole } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiskScoresController {
  constructor(private readonly riskScoringService: RiskScoringService) {}

  @Get('risk-scores')
  async getRiskScores(
    @Query() query: QueryRiskScoresDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.riskScoringService.getRiskScores(query, user);
  }

  @Get('mines/:mineId/risk-score')
  async getLatestMineRiskScore(
    @Param('mineId') mineId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.riskScoringService.getLatestMineRiskScore(
      mineId,
      user,
    );
    return { data };
  }

  @Post('risk-scores/recalculate')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR)
  async recalculateRiskScores(@Body() dto: RecalculateRiskDto) {
    const clock = dto.now ? new Date(dto.now) : new Date();
    const data = await this.riskScoringService.recalculateAllMines(
      clock,
      dto.mineId,
    );
    return { data };
  }
}
