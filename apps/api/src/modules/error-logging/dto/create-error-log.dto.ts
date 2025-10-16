import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ErrorSource {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  API = 'API',
  DATABASE = 'DATABASE',
  EXTERNAL = 'EXTERNAL',
}

export class CreateErrorLogDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ enum: ErrorSource, description: 'Error source' })
  @IsEnum(ErrorSource)
  source!: ErrorSource;

  @ApiProperty({ enum: ErrorSeverity, description: 'Error severity level' })
  @IsEnum(ErrorSeverity)
  level!: ErrorSeverity;

  @ApiProperty({ description: 'Error message' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ description: 'Error stack trace' })
  @IsString()
  @IsOptional()
  stack?: string;

  @ApiPropertyOptional({ description: 'Additional context' })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}

