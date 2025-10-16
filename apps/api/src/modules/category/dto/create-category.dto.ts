import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { CategoryStatus } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Category slug (auto-generated if not provided)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiProperty({ enum: CategoryStatus, description: 'Category status', default: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiProperty({ description: 'Parent category ID (for hierarchy)', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: 'Category icon', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;


  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  sortOrder?: number;
}
