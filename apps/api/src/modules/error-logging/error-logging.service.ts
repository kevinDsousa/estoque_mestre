import { Injectable } from '@nestjs/common';
import { ErrorLogsPrismaService } from '../../database/error-logs-prisma.service';
import { CreateErrorLogDto } from './dto/create-error-log.dto';

@Injectable()
export class ErrorLoggingService {
  constructor(
    private errorLogsPrisma: ErrorLogsPrismaService,
  ) {}

  async logError(errorData: CreateErrorLogDto) {
    try {
      // For now, just log to console until we set up the error logs database
      console.error('Error logged:', {
        ...errorData,
        timestamp: new Date().toISOString(),
      });
      return { success: true, message: 'Error logged successfully' };
    } catch (error) {
      // Fallback to console if database logging fails
      console.error('Failed to log error to database:', error);
      console.error('Original error:', errorData);
    }
  }

  async logFrontendError(
    userId: string,
    companyId: string,
    error: any,
    userAgent?: string,
    url?: string,
  ) {
    const errorData: CreateErrorLogDto = {
      userId,
      companyId,
      source: 'FRONTEND' as any,
      level: 'HIGH' as any,
      message: error.message || 'Unknown frontend error',
      stack: error.stack,
      context: {
        userAgent,
        url,
        timestamp: new Date().toISOString(),
        ...error,
      },
    };

    return this.logError(errorData);
  }

  async logBackendError(
    userId: string,
    companyId: string,
    error: any,
    context?: any,
  ) {
    const errorData: CreateErrorLogDto = {
      userId,
      companyId,
      source: 'BACKEND' as any,
      level: 'HIGH' as any,
      message: error.message || 'Unknown backend error',
      stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        ...error,
      },
    };

    return this.logError(errorData);
  }

  async getErrorsByCompany(companyId: string, limit = 100) {
    // For now, return empty array until we set up the error logs database
    return [];
  }

  async getErrorsByUser(userId: string, limit = 100) {
    // For now, return empty array until we set up the error logs database
    return [];
  }

  async getErrorStats(companyId: string, days = 30) {
    // For now, return empty stats until we set up the error logs database
    return {
      total: 0,
      byLevel: {},
      bySource: {},
    };
  }
}
