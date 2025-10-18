import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DatabaseModule } from '../../database/database.module';
import { NotificationScheduler } from './notification.scheduler';
import { EmailModule } from '../email/email.module';
import { NotificationCacheService } from '../../common/cache/notification-cache.service';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationScheduler, NotificationCacheService],
  exports: [NotificationService],
})
export class NotificationModule {}
