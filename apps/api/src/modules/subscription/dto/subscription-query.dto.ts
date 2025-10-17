import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus, SubscriptionPaymentStatus } from '@prisma/client';

export class SubscriptionQueryDto {
  @ApiProperty({ description: 'Page number', default: 1, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({ 
    enum: SubscriptionStatus, 
    description: 'Filter by subscription status',
    required: false 
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiProperty({ 
    enum: SubscriptionPaymentStatus, 
    description: 'Filter by payment status',
    required: false 
  })
  @IsEnum(SubscriptionPaymentStatus)
  @IsOptional()
  paymentStatus?: SubscriptionPaymentStatus;

  @ApiProperty({ description: 'Filter by plan ID', required: false })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiProperty({ description: 'Filter by minimum amount (in cents)', required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @ApiProperty({ description: 'Filter by maximum amount (in cents)', required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAmount?: number;

  @ApiProperty({ description: 'Filter by billing interval', required: false })
  @IsString()
  @IsOptional()
  interval?: string;

  @ApiProperty({ description: 'Filter by trial status', required: false })
  @IsOptional()
  isInTrial?: boolean;

  @ApiProperty({ description: 'Filter by date from (ISO string)', required: false })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({ description: 'Filter by date to (ISO string)', required: false })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiProperty({ description: 'Search term', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    description: 'Sort field', 
    enum: ['createdAt', 'amount', 'status', 'nextBillingDate'],
    default: 'createdAt',
    required: false 
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({ 
    description: 'Sort order', 
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false 
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
