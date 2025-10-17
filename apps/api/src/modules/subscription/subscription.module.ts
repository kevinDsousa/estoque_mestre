import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { DatabaseModule } from '../../database/database.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [DatabaseModule, StripeModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
