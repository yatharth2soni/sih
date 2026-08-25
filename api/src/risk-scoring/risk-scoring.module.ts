import { Module } from '@nestjs/common';
import { RiskScoresController } from './risk-scores.controller';
import { AnomaliesController } from './anomalies.controller';
import { RiskScoringService } from './risk-scoring.service';
import { ScopeService } from '../common/services/scope.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  controllers: [RiskScoresController, AnomaliesController],
  providers: [RiskScoringService, ScopeService],
  exports: [RiskScoringService],
})
export class RiskScoringModule {}
