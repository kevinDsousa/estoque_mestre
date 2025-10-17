import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { DatabaseModule } from '../../database/database.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [DatabaseModule, StripeModule],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
