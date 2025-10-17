import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsBoolean, Min } from 'class-validator';
import { PlanType, PlanStatus } from '@prisma/client';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ description: 'Plan name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Plan description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Plan slug (URL-friendly name)' })
  @IsString()
  slug: string;

  @ApiProperty({ 
    enum: PlanType, 
    description: 'Plan type' 
  })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiProperty({ 
    enum: PlanStatus, 
    description: 'Plan status',
    default: PlanStatus.ACTIVE 
  })
  @IsEnum(PlanStatus)
  @IsOptional()
  status?: PlanStatus = PlanStatus.ACTIVE;

  @ApiProperty({ description: 'Monthly price in cents', example: 15000 })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ description: 'Yearly price in cents', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyPrice?: number;

  @ApiProperty({ description: 'Currency code', default: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string = 'BRL';

  @ApiProperty({ description: 'Plan features as JSON object' })
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

  @ApiProperty({ description: 'Is popular plan', default: false })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean = false;

  @ApiProperty({ description: 'Is recommended plan', default: false })
  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean = false;

  @ApiProperty({ description: 'Display order', default: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number = 0;

  @ApiProperty({ description: 'Is public plan', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = true;

  @ApiProperty({ description: 'Available from date', required: false })
  @IsString()
  @IsOptional()
  availableFrom?: string;

  @ApiProperty({ description: 'Available until date', required: false })
  @IsString()
  @IsOptional()
  availableUntil?: string;

  @ApiProperty({ description: 'Trial days', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  trialDays?: number = 0;

  @ApiProperty({ description: 'Is promotional plan', default: false })
  @IsBoolean()
  @IsOptional()
  isPromotional?: boolean = false;

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

  @ApiProperty({ description: 'Referral reward in cents', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  referralReward?: number = 0;

  @ApiProperty({ description: 'Referral reward type', default: 'fixed' })
  @IsString()
  @IsOptional()
  referralRewardType?: string = 'fixed';
}
