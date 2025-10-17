import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsBoolean, Min } from 'class-validator';
import { PlanType } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Subscription plan ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Stripe price ID' })
  @IsString()
  stripePriceId: string;

  @ApiProperty({ description: 'Payment amount in cents', example: 15000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string = 'BRL';

  @ApiProperty({ description: 'Billing interval', default: 'month' })
  @IsString()
  @IsOptional()
  interval?: string = 'month';

  @ApiProperty({ description: 'Interval count', default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  intervalCount?: number = 1;

  @ApiProperty({ description: 'Subscription features as JSON object' })
  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @ApiProperty({ description: 'Billing information as JSON object' })
  @IsObject()
  @IsOptional()
  billing?: Record<string, any>;

  @ApiProperty({ description: 'Trial start date' })
  @IsString()
  @IsOptional()
  trialStart?: string;

  @ApiProperty({ description: 'Trial end date' })
  @IsString()
  @IsOptional()
  trialEnd?: string;

  @ApiProperty({ description: 'Is in trial period', default: false })
  @IsBoolean()
  @IsOptional()
  isInTrial?: boolean = false;

  @ApiProperty({ description: 'Current period start date' })
  @IsString()
  currentPeriodStart: string;

  @ApiProperty({ description: 'Current period end date' })
  @IsString()
  currentPeriodEnd: string;

  @ApiProperty({ description: 'Next billing date' })
  @IsString()
  @IsOptional()
  nextBillingDate?: string;

  @ApiProperty({ description: 'Stripe payment method ID' })
  @IsString()
  @IsOptional()
  stripePaymentMethodId?: string;
}
