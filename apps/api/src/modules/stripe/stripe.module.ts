import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
