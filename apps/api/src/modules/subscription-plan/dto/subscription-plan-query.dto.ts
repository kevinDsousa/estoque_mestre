import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PlanType, PlanStatus } from '@prisma/client';

export class SubscriptionPlanQueryDto {
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
    enum: PlanType, 
    description: 'Filter by plan type',
    required: false 
  })
  @IsEnum(PlanType)
  @IsOptional()
  type?: PlanType;

  @ApiProperty({ 
    enum: PlanStatus, 
    description: 'Filter by plan status',
    required: false 
  })
  @IsEnum(PlanStatus)
  @IsOptional()
  status?: PlanStatus;

  @ApiProperty({ description: 'Filter by minimum price (in cents)', required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ description: 'Filter by maximum price (in cents)', required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ description: 'Filter by currency', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Filter by popular plans', required: false })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiProperty({ description: 'Filter by recommended plans', required: false })
  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;

  @ApiProperty({ description: 'Filter by public plans', required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ description: 'Filter by promotional plans', required: false })
  @IsBoolean()
  @IsOptional()
  isPromotional?: boolean;

  @ApiProperty({ description: 'Search term', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    description: 'Sort field', 
    enum: ['createdAt', 'monthlyPrice', 'displayOrder', 'name'],
    default: 'displayOrder',
    required: false 
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'displayOrder';

  @ApiProperty({ 
    description: 'Sort order', 
    enum: ['asc', 'desc'],
    default: 'asc',
    required: false 
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
