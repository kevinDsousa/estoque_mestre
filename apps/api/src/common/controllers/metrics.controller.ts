import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Response } from 'express';
import { MetricsService } from '../services/metrics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../guards/role.guard';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { UserRole } from '@prisma/client';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get Prometheus metrics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Metrics in Prometheus format' })
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  }

  @Get('json')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get metrics in JSON format (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Metrics in JSON format' })
  async getMetricsAsJson() {
    return this.metricsService.getMetricsAsJson();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health metrics' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async getHealthMetrics() {
    const metrics = await this.metricsService.getMetricsAsJson();
    
    // Extract health-related metrics
    const healthMetrics = metrics.filter((metric: any) => 
      metric.name.includes('system_health') || 
      metric.name.includes('uptime') ||
      metric.name.includes('memory_usage') ||
      metric.name.includes('cpu_usage')
    );

    return {
      timestamp: new Date().toISOString(),
      metrics: healthMetrics,
      status: 'healthy', // This would be determined by actual health checks
    };
  }

  @Get('business')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get business metrics (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Business metrics' })
  async getBusinessMetrics() {
    const metrics = await this.metricsService.getMetricsAsJson();
    
    // Extract business-related metrics
    const businessMetrics = metrics.filter((metric: any) => 
      metric.name.includes('business_operations') ||
      metric.name.includes('sales_amount') ||
      metric.name.includes('inventory_value') ||
      metric.name.includes('payments_processed') ||
      metric.name.includes('notifications_sent')
    );

    return {
      timestamp: new Date().toISOString(),
      metrics: businessMetrics,
    };
  }

  @Get('system')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get system metrics (Admin only)' })
  @ApiResponse({ status: 200, description: 'System metrics' })
  async getSystemMetrics() {
    const metrics = await this.metricsService.getMetricsAsJson();
    
    // Extract system-related metrics
    const systemMetrics = metrics.filter((metric: any) => 
      metric.name.includes('http_requests') ||
      metric.name.includes('database_query') ||
      metric.name.includes('errors_total') ||
      metric.name.includes('memory_usage') ||
      metric.name.includes('cpu_usage')
    );

    return {
      timestamp: new Date().toISOString(),
      metrics: systemMetrics,
    };
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get alert conditions based on metrics' })
  @ApiResponse({ status: 200, description: 'Current alert conditions' })
  async getAlerts() {
    const metrics = await this.metricsService.getMetricsAsJson();
    const alerts: any[] = [];

    // Check for various alert conditions
    for (const metric of metrics) {
      if (metric.name === 'errors_total' && metric.values) {
        for (const value of metric.values) {
          if (value.value > 10) { // More than 10 errors
            alerts.push({
              type: 'error_rate_high',
              severity: 'high',
              message: `High error rate detected: ${value.value} errors`,
              labels: value.labels,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      if (metric.name === 'http_request_duration_seconds' && metric.values) {
        for (const value of metric.values) {
          if (value.value > 5) { // Requests taking more than 5 seconds
            alerts.push({
              type: 'slow_response',
              severity: 'medium',
              message: `Slow response detected: ${value.value}s`,
              labels: value.labels,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      if (metric.name === 'low_stock_items' && metric.values) {
        for (const value of metric.values) {
          if (value.value > 20) { // More than 20 low stock items
            alerts.push({
              type: 'low_stock_alert',
              severity: 'medium',
              message: `High number of low stock items: ${value.value}`,
              labels: value.labels,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      if (metric.name === 'out_of_stock_items' && metric.values) {
        for (const value of metric.values) {
          if (value.value > 0) { // Any out of stock items
            alerts.push({
              type: 'out_of_stock_alert',
              severity: 'high',
              message: `Out of stock items detected: ${value.value}`,
              labels: value.labels,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      if (metric.name === 'system_health' && metric.values) {
        for (const value of metric.values) {
          if (value.value === 0) { // System unhealthy
            alerts.push({
              type: 'system_unhealthy',
              severity: 'critical',
              message: `System component unhealthy: ${value.labels?.component}`,
              labels: value.labels,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      alerts,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      highAlerts: alerts.filter(a => a.severity === 'high').length,
      mediumAlerts: alerts.filter(a => a.severity === 'medium').length,
    };
  }

  @Get('prometheus')
  @UseGuards(BasicAuthGuard)
  @ApiExcludeEndpoint() // Hide from Swagger as this is for Prometheus scraping
  async getPrometheusMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  }
}
