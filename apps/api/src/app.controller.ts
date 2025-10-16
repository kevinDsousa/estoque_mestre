import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { DatabaseHealthCheckService } from './database/health-check.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dbHealth: DatabaseHealthCheckService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is running',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'string', example: 'Estoque Mestre API is running!' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health information',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 123.456 },
            environment: { type: 'string', example: 'development' },
            version: { type: 'string', example: '1.0.0' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database connection OK' })
  async getDbHealth() {
    return this.dbHealth.check();
  }
}
