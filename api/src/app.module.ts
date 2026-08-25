import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { MinesModule } from './mines/mines.module';
import { ComplianceModule } from './compliance/compliance.module';
import { InspectionsModule } from './inspections/inspections.module';
import { ObservationsModule } from './observations/observations.module';
import { ViolationsModule } from './violations/violations.module';
import { CorrectiveActionsModule } from './corrective-actions/corrective-actions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AlertsModule } from './alerts/alerts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { RiskScoringModule } from './risk-scoring/risk-scoring.module';
import { ContractorsModule } from './contractors/contractors.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GrievancesModule } from './grievances/grievances.module';
import { OcrModule } from './ocr/ocr.module';
import { AuditModule } from './audit/audit.module';
import { AssistantModule } from './assistant/assistant.module';
import { HealthController } from './health/health.controller';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10,  // 10 requests per minute (applied to decorated routes)
      },
    ]),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    MinesModule,
    ComplianceModule,
    InspectionsModule,
    ObservationsModule,
    ViolationsModule,
    CorrectiveActionsModule,
    NotificationsModule,
    AlertsModule,
    DashboardModule,
    ReportsModule,
    RiskScoringModule,
    ContractorsModule,
    AttendanceModule,
    GrievancesModule,
    OcrModule,
    AuditModule,
    AssistantModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
