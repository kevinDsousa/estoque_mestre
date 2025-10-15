/**
 * Create Error Log Request DTO
 */

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsDate } from 'class-validator';
import { ErrorSeverity, ErrorSource } from '../../interfaces/error-log.interface';

export class CreateErrorLogRequestDto {
  @IsString()
  @IsNotEmpty()
  errorId: string;

  @IsString()
  @IsNotEmpty()
  errorType: string;

  @IsString()
  @IsNotEmpty()
  errorMessage: string;

  @IsString()
  @IsOptional()
  errorCode?: string;

  @IsEnum(ErrorSeverity)
  severity: ErrorSeverity;

  @IsEnum(ErrorSource)
  source: ErrorSource;

  @IsString()
  @IsOptional()
  component?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsObject()
  @IsOptional()
  browserInfo?: Record<string, any>;

  @IsObject()
  @IsOptional()
  deviceInfo?: Record<string, any>;

  @IsObject()
  @IsOptional()
  networkInfo?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsDate()
  timestamp: Date;
}

export class CreateErrorLogBatchRequestDto {
  @IsArray()
  errors: CreateErrorLogRequestDto[];
}
