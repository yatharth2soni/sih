import { Module, Global } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { EscalationService } from './escalation.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [NotificationsModule],
  controllers: [AlertsController],
  providers: [EscalationService, NotificationSchedulerService],
  exports: [EscalationService, NotificationSchedulerService],
})
export class AlertsModule {}
