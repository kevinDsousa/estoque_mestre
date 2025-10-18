import { Module } from '@nestjs/common';
import { MetricsService } from '../services/metrics.service';
import { AlertsService } from '../services/alerts.service';
import { MetricsController } from '../controllers/metrics.controller';
import { AlertsController } from '../controllers/alerts.controller';
import { DatabaseModule } from '../../database/database.module';
import { NotificationModule } from '../../modules/notification/notification.module';
import { EmailModule } from '../../modules/email/email.module';

@Module({
  imports: [DatabaseModule, NotificationModule, EmailModule],
  controllers: [MetricsController, AlertsController],
  providers: [MetricsService, AlertsService],
  exports: [MetricsService, AlertsService],
})
export class MetricsModule {}
