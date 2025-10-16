import { Injectable } from '@nestjs/common';
import { ErrorLogsPrismaService } from '../../database/error-logs-prisma.service';
import { CreateErrorLogDto } from '@estoque-mestre/models';

@Injectable()
export class ErrorLoggingService {
  constructor(
    private errorLogsPrisma: ErrorLogsPrismaService,
  ) {}

  async logError(errorData: CreateErrorLogDto) {
    try {
      return await this.errorLogsPrisma.errorLog.create({
        data: {
          ...errorData,
          timestamp: new Date(),
        },
      });
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
      source: 'FRONTEND',
      level: 'ERROR',
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
      source: 'BACKEND',
      level: 'ERROR',
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
    return this.errorLogsPrisma.errorLog.findMany({
      where: { companyId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getErrorsByUser(userId: string, limit = 100) {
    return this.errorLogsPrisma.errorLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getErrorStats(companyId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, byLevel, bySource] = await Promise.all([
      this.errorLogsPrisma.errorLog.count({
        where: {
          companyId,
          timestamp: { gte: startDate },
        },
      }),
      this.errorLogsPrisma.errorLog.groupBy({
        by: ['level'],
        where: {
          companyId,
          timestamp: { gte: startDate },
        },
        _count: true,
      }),
      this.errorLogsPrisma.errorLog.groupBy({
        by: ['source'],
        where: {
          companyId,
          timestamp: { gte: startDate },
        },
        _count: true,
      }),
    ]);

    return {
      total,
      byLevel: byLevel.reduce((acc, item) => {
        acc[item.level] = item._count;
        return acc;
      }, {}),
      bySource: bySource.reduce((acc, item) => {
        acc[item.source] = item._count;
        return acc;
      }, {}),
    };
  }
}
