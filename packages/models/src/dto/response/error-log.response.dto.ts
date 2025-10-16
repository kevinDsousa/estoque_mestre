/**
 * Error Log Response DTO
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorSeverity, ErrorSource, ErrorStatus } from '../../interfaces/error-log.interface';

export class ErrorLogResponseDto {
  @ApiProperty({ description: 'Error log ID' })
  id!: string;

  @ApiProperty({ description: 'Unique error identifier' })
  errorId!: string;

  @ApiProperty({ description: 'Type of error' })
  errorType!: string;

  @ApiProperty({ description: 'Error message' })
  errorMessage!: string;

  @ApiPropertyOptional({ description: 'Error code' })
  errorCode?: string;

  @ApiProperty({ enum: ErrorSeverity, description: 'Error severity level' })
  severity!: ErrorSeverity;

  @ApiProperty({ enum: ErrorSource, description: 'Error source' })
  source!: ErrorSource;

  @ApiPropertyOptional({ description: 'Component where error occurred' })
  component?: string;

  @ApiPropertyOptional({ description: 'URL where error occurred' })
  url?: string;

  @ApiPropertyOptional({ description: 'HTTP method' })
  method?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  sessionId?: string;

  @ApiProperty({ enum: ErrorStatus, description: 'Error status' })
  status!: ErrorStatus;

  @ApiPropertyOptional({ description: 'When error was processed' })
  processedAt?: Date;

  @ApiPropertyOptional({ description: 'Who processed the error' })
  processedBy?: string;

  @ApiProperty({ description: 'Error timestamp' })
  timestamp!: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  // Computed fields
  @ApiProperty({ description: 'Severity color for UI' })
  severityColor!: string;

  @ApiProperty({ description: 'Source icon for UI' })
  sourceIcon!: string;

  @ApiProperty({ description: 'Age in minutes' })
  ageInMinutes!: number;

  @ApiProperty({ description: 'Error summary' })
  summary!: string;
}

export class ErrorLogListResponseDto {
  @ApiProperty({ type: [ErrorLogResponseDto], description: 'List of error logs' })
  data!: ErrorLogResponseDto[];

  @ApiProperty({ description: 'Total number of errors' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;
}

export class ErrorLogAnalyticsResponseDto {
  @ApiProperty({ description: 'Total number of errors' })
  totalErrors!: number;

  @ApiProperty({ description: 'Number of critical errors' })
  criticalErrors!: number;

  @ApiProperty({ description: 'Errors today' })
  errorsToday!: number;

  @ApiProperty({ description: 'Errors this week' })
  errorsThisWeek!: number;
  
  @ApiProperty({ description: 'Breakdown by severity' })
  severityBreakdown!: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  @ApiProperty({ description: 'Breakdown by source' })
  sourceBreakdown!: {
    frontend: number;
    backend: number;
    api: number;
    database: number;
  };
  
  @ApiProperty({ description: 'Breakdown by company' })
  companyBreakdown!: Array<{
    companyId: string;
    companyName: string;
    errorCount: number;
  }>;
  
  @ApiProperty({ description: 'Error trends over time' })
  trends!: {
    last24Hours: number[];
    last7Days: number[];
    last30Days: number[];
  };
  
  @ApiProperty({ description: 'Most frequent errors' })
  topErrors!: Array<{
    errorType: string;
    errorMessage: string;
    count: number;
    lastOccurrence: Date;
  }>;
}
