import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from '../services/alerts.service';
import type { AlertRule, Alert } from '../services/alerts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../guards/role.guard';
import { UserRole } from '@prisma/client';
import { AuthContext } from '../decorators/auth-context.decorator';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all active alerts (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Active alerts retrieved successfully' })
  async getActiveAlerts(@AuthContext() authContext: any): Promise<Alert[]> {
    const alerts = await this.alertsService.getActiveAlerts();
    // Filter alerts by company if not admin
    if (authContext.role !== UserRole.ADMIN) {
      return alerts.filter(alert => alert.companyId === authContext.companyId);
    }
    return alerts;
  }

  @Get('rules')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all alert rules (Admin only)' })
  @ApiResponse({ status: 200, description: 'Alert rules retrieved successfully' })
  async getAlertRules(): Promise<AlertRule[]> {
    return this.alertsService.getAlertRules();
  }

  @Post('rules')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new alert rule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Alert rule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid alert rule data' })
  async createAlertRule(@Body() rule: AlertRule): Promise<{ message: string; rule: AlertRule }> {
    await this.alertsService.addAlertRule(rule);
    return {
      message: 'Alert rule created successfully',
      rule,
    };
  }

  @Patch('rules/:ruleId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an alert rule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Alert rule updated successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  async updateAlertRule(
    @Param('ruleId') ruleId: string,
    @Body() updates: Partial<AlertRule>,
  ): Promise<{ message: string }> {
    await this.alertsService.updateAlertRule(ruleId, updates);
    return { message: 'Alert rule updated successfully' };
  }

  @Delete('rules/:ruleId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an alert rule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Alert rule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  async deleteAlertRule(@Param('ruleId') ruleId: string): Promise<{ message: string }> {
    await this.alertsService.deleteAlertRule(ruleId);
    return { message: 'Alert rule deleted successfully' };
  }

  @Patch(':alertId/acknowledge')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Acknowledge an alert (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async acknowledgeAlert(
    @Param('alertId') alertId: string,
    @AuthContext() authContext: any,
  ): Promise<{ message: string }> {
    await this.alertsService.acknowledgeAlert(alertId, authContext.userId);
    return { message: 'Alert acknowledged successfully' };
  }

  @Patch(':alertId/resolve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Resolve an alert (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async resolveAlert(@Param('alertId') alertId: string): Promise<{ message: string }> {
    await this.alertsService.resolveAlert(alertId);
    return { message: 'Alert resolved successfully' };
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get alerts dashboard data (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Alerts dashboard data retrieved successfully' })
  async getAlertsDashboard(@AuthContext() authContext: any) {
    const alerts = await this.alertsService.getActiveAlerts();
    const rules = await this.alertsService.getAlertRules();

    // Filter by company if not admin
    const filteredAlerts = authContext.role !== UserRole.ADMIN 
      ? alerts.filter(alert => alert.companyId === authContext.companyId)
      : alerts;

    const summary = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      high: filteredAlerts.filter(a => a.severity === 'high').length,
      medium: filteredAlerts.filter(a => a.severity === 'medium').length,
      low: filteredAlerts.filter(a => a.severity === 'low').length,
      acknowledged: filteredAlerts.filter(a => a.acknowledgedAt).length,
      resolved: filteredAlerts.filter(a => a.resolvedAt).length,
    };

    const recentAlerts = filteredAlerts
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, 10);

    const alertsBySeverity = {
      critical: filteredAlerts.filter(a => a.severity === 'critical'),
      high: filteredAlerts.filter(a => a.severity === 'high'),
      medium: filteredAlerts.filter(a => a.severity === 'medium'),
      low: filteredAlerts.filter(a => a.severity === 'low'),
    };

    return {
      summary,
      recentAlerts,
      alertsBySeverity,
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get alert metrics (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Alert metrics retrieved successfully' })
  async getAlertMetrics(@AuthContext() authContext: any) {
    const alerts = await this.alertsService.getActiveAlerts();
    const rules = await this.alertsService.getAlertRules();

    // Filter by company if not admin
    const filteredAlerts = authContext.role !== UserRole.ADMIN 
      ? alerts.filter(alert => alert.companyId === authContext.companyId)
      : alerts;

    // Calculate metrics for the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = filteredAlerts.filter(alert => alert.triggeredAt >= last24Hours);

    const metrics = {
      totalAlerts: filteredAlerts.length,
      alertsLast24h: recentAlerts.length,
      averageResolutionTime: this.calculateAverageResolutionTime(filteredAlerts),
      alertsByRule: this.groupAlertsByRule(filteredAlerts),
      alertsBySeverity: this.groupAlertsBySeverity(filteredAlerts),
      alertsByCompany: this.groupAlertsByCompany(filteredAlerts),
      topTriggeredRules: this.getTopTriggeredRules(filteredAlerts, rules),
    };

    return {
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  private calculateAverageResolutionTime(alerts: Alert[]): number {
    const resolvedAlerts = alerts.filter(alert => alert.resolvedAt);
    if (resolvedAlerts.length === 0) return 0;

    const totalTime = resolvedAlerts.reduce((sum, alert) => {
      const resolutionTime = alert.resolvedAt!.getTime() - alert.triggeredAt.getTime();
      return sum + resolutionTime;
    }, 0);

    return totalTime / resolvedAlerts.length / (1000 * 60); // Convert to minutes
  }

  private groupAlertsByRule(alerts: Alert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.ruleId] = (acc[alert.ruleId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupAlertsBySeverity(alerts: Alert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupAlertsByCompany(alerts: Alert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.companyId] = (acc[alert.companyId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopTriggeredRules(alerts: Alert[], rules: AlertRule[]): Array<{ rule: AlertRule; count: number }> {
    const ruleCounts = this.groupAlertsByRule(alerts);
    
    return Object.entries(ruleCounts)
      .map(([ruleId, count]) => ({
        rule: rules.find(r => r.id === ruleId)!,
        count,
      }))
      .filter(item => item.rule)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}
