import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsBoolean, Min } from 'class-validator';
import { PlanStatus } from '@prisma/client';

export class UpdateSubscriptionPlanDto {
  @ApiProperty({ description: 'Plan name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Plan description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Plan slug (URL-friendly name)', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ 
    enum: PlanStatus, 
    description: 'Plan status',
    required: false 
  })
  @IsEnum(PlanStatus)
  @IsOptional()
  status?: PlanStatus;

  @ApiProperty({ description: 'Monthly price in cents', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyPrice?: number;

  @ApiProperty({ description: 'Yearly price in cents', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyPrice?: number;

  @ApiProperty({ description: 'Currency code', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Plan features as JSON object', required: false })
  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @ApiProperty({ description: 'Stripe price ID', required: false })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiProperty({ description: 'Stripe product ID', required: false })
  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @ApiProperty({ description: 'Is popular plan', required: false })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiProperty({ description: 'Is recommended plan', required: false })
  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;

  @ApiProperty({ description: 'Display order', required: false })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({ description: 'Is public plan', required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ description: 'Available from date', required: false })
  @IsString()
  @IsOptional()
  availableFrom?: string;

  @ApiProperty({ description: 'Available until date', required: false })
  @IsString()
  @IsOptional()
  availableUntil?: string;

  @ApiProperty({ description: 'Trial days', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  trialDays?: number;

  @ApiProperty({ description: 'Is promotional plan', required: false })
  @IsBoolean()
  @IsOptional()
  isPromotional?: boolean;

  @ApiProperty({ description: 'Promotional price in cents', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  promotionalPrice?: number;

  @ApiProperty({ description: 'Promotional start date', required: false })
  @IsString()
  @IsOptional()
  promotionalStartDate?: string;

  @ApiProperty({ description: 'Promotional end date', required: false })
  @IsString()
  @IsOptional()
  promotionalEndDate?: string;

  @ApiProperty({ description: 'Promotional description', required: false })
  @IsString()
  @IsOptional()
  promotionalDescription?: string;

  @ApiProperty({ description: 'Referral reward in cents', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  referralReward?: number;

  @ApiProperty({ description: 'Referral reward type', required: false })
  @IsString()
  @IsOptional()
  referralRewardType?: string;
}
