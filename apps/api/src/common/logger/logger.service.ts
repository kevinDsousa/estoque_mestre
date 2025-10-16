import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  constructor(private configService: ConfigService) {}

  log(message: string, context?: string, data?: any) {
    const logData = {
      message,
      context: context || 'Application',
      timestamp: new Date().toISOString(),
      level: 'info',
      environment: this.configService.get<string>('app.environment'),
      ...(data && { data }),
    };

    this.logger.log(JSON.stringify(logData));
  }

  error(message: string, trace?: string, context?: string, data?: any) {
    const logData = {
      message,
      context: context || 'Application',
      timestamp: new Date().toISOString(),
      level: 'error',
      environment: this.configService.get<string>('app.environment'),
      ...(trace && { trace }),
      ...(data && { data }),
    };

    this.logger.error(JSON.stringify(logData));
  }

  warn(message: string, context?: string, data?: any) {
    const logData = {
      message,
      context: context || 'Application',
      timestamp: new Date().toISOString(),
      level: 'warn',
      environment: this.configService.get<string>('app.environment'),
      ...(data && { data }),
    };

    this.logger.warn(JSON.stringify(logData));
  }

  debug(message: string, context?: string, data?: any) {
    const logData = {
      message,
      context: context || 'Application',
      timestamp: new Date().toISOString(),
      level: 'debug',
      environment: this.configService.get<string>('app.environment'),
      ...(data && { data }),
    };

    this.logger.debug(JSON.stringify(logData));
  }

  verbose(message: string, context?: string, data?: any) {
    const logData = {
      message,
      context: context || 'Application',
      timestamp: new Date().toISOString(),
      level: 'verbose',
      environment: this.configService.get<string>('app.environment'),
      ...(data && { data }),
    };

    this.logger.verbose(JSON.stringify(logData));
  }
}
