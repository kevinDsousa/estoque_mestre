import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsBoolean, Min } from 'class-validator';
import { SubscriptionStatus, SubscriptionPaymentStatus } from '@prisma/client';

export class UpdateSubscriptionDto {
  @ApiProperty({ 
    enum: SubscriptionStatus, 
    description: 'Subscription status' 
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiProperty({ 
    enum: SubscriptionPaymentStatus, 
    description: 'Payment status' 
  })
  @IsEnum(SubscriptionPaymentStatus)
  @IsOptional()
  paymentStatus?: SubscriptionPaymentStatus;

  @ApiProperty({ description: 'Subscription features as JSON object' })
  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @ApiProperty({ description: 'Billing information as JSON object' })
  @IsObject()
  @IsOptional()
  billing?: Record<string, any>;

  @ApiProperty({ description: 'Is in trial period' })
  @IsBoolean()
  @IsOptional()
  isInTrial?: boolean;

  @ApiProperty({ description: 'Current period start date' })
  @IsString()
  @IsOptional()
  currentPeriodStart?: string;

  @ApiProperty({ description: 'Current period end date' })
  @IsString()
  @IsOptional()
  currentPeriodEnd?: string;

  @ApiProperty({ description: 'Next billing date' })
  @IsString()
  @IsOptional()
  nextBillingDate?: string;

  @ApiProperty({ description: 'Last payment date' })
  @IsString()
  @IsOptional()
  lastPaymentDate?: string;

  @ApiProperty({ description: 'Last payment amount in cents' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lastPaymentAmount?: number;

  @ApiProperty({ description: 'Failed payment count' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  failedPaymentCount?: number;

  @ApiProperty({ description: 'Last failed payment date' })
  @IsString()
  @IsOptional()
  lastFailedPaymentDate?: string;

  @ApiProperty({ description: 'Cancel at period end' })
  @IsBoolean()
  @IsOptional()
  cancelAtPeriodEnd?: boolean;

  @ApiProperty({ description: 'Canceled at date' })
  @IsString()
  @IsOptional()
  canceledAt?: string;

  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @ApiProperty({ description: 'Discount code' })
  @IsString()
  @IsOptional()
  discountCode?: string;
}
