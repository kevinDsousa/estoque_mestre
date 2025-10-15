/**
 * Error Log Response DTO
 */

import { ErrorSeverity, ErrorSource, ErrorStatus } from '../../interfaces/error-log.interface';

export class ErrorLogResponseDto {
  id: string;
  errorId: string;
  errorType: string;
  errorMessage: string;
  errorCode?: string;
  severity: ErrorSeverity;
  source: ErrorSource;
  component?: string;
  url?: string;
  method?: string;
  userId?: string;
  companyId?: string;
  sessionId?: string;
  status: ErrorStatus;
  processedAt?: Date;
  processedBy?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;

  // Computed fields
  severityColor: string;
  sourceIcon: string;
  ageInMinutes: number;
  summary: string;
}

export class ErrorLogListResponseDto {
  data: ErrorLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ErrorLogAnalyticsResponseDto {
  totalErrors: number;
  criticalErrors: number;
  errorsToday: number;
  errorsThisWeek: number;
  
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  sourceBreakdown: {
    frontend: number;
    backend: number;
    api: number;
    database: number;
  };
  
  companyBreakdown: Array<{
    companyId: string;
    companyName: string;
    errorCount: number;
  }>;
  
  trends: {
    last24Hours: number[];
    last7Days: number[];
    last30Days: number[];
  };
  
  topErrors: Array<{
    errorType: string;
    errorMessage: string;
    count: number;
    lastOccurrence: Date;
  }>;
}
