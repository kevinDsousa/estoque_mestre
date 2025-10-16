/**
 * Create Error Log Request DTO
 */

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorSeverity, ErrorSource } from '../../interfaces/error-log.interface';

export class CreateErrorLogRequestDto {
  @ApiProperty({ description: 'Unique error identifier' })
  @IsString()
  @IsNotEmpty()
  errorId!: string;

  @ApiProperty({ description: 'Type of error' })
  @IsString()
  @IsNotEmpty()
  errorType!: string;

  @ApiProperty({ description: 'Error message' })
  @IsString()
  @IsNotEmpty()
  errorMessage!: string;

  @ApiPropertyOptional({ description: 'Error code' })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiProperty({ enum: ErrorSeverity, description: 'Error severity level' })
  @IsEnum(ErrorSeverity)
  severity!: ErrorSeverity;

  @ApiProperty({ enum: ErrorSource, description: 'Error source' })
  @IsEnum(ErrorSource)
  source!: ErrorSource;

  @ApiPropertyOptional({ description: 'Component where error occurred' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'URL where error occurred' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'HTTP method' })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Browser information' })
  @IsObject()
  @IsOptional()
  browserInfo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Device information' })
  @IsObject()
  @IsOptional()
  deviceInfo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Network information' })
  @IsObject()
  @IsOptional()
  networkInfo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Error tags' })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Error timestamp' })
  @IsDate()
  timestamp!: Date;
}

export class CreateErrorLogBatchRequestDto {
  @ApiProperty({ description: 'Array of errors to log', type: [CreateErrorLogRequestDto] })
  @IsArray()
  errors!: CreateErrorLogRequestDto[];
}
