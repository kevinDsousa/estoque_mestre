import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MetricsService } from './metrics.service';
import { NotificationService } from '../../modules/notification/notification.service';
import { EmailService } from '../../modules/email/email.service';
import { PrismaService } from '../../database/prisma.service';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // minutes
  notificationChannels: ('email' | 'in_app' | 'webhook')[];
  recipients: string[]; // email addresses or user IDs
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  labels: Record<string, string>;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  companyId: string;
}

@Injectable()
export class AlertsService implements OnModuleInit {
  private readonly alertRules: AlertRule[] = [
    {
      id: 'high_error_rate',
      name: 'High Error Rate',
      description: 'Alert when error rate exceeds threshold',
      metric: 'errors_total',
      condition: 'gt',
      threshold: 10,
      severity: 'high',
      enabled: true,
      cooldown: 15,
      notificationChannels: ['email', 'in_app'],
      recipients: ['admin@estoquemestre.com'],
    },
    {
      id: 'slow_response_time',
      name: 'Slow Response Time',
      description: 'Alert when response time exceeds threshold',
      metric: 'http_request_duration_seconds',
      condition: 'gt',
      threshold: 5,
      severity: 'medium',
      enabled: true,
      cooldown: 10,
      notificationChannels: ['in_app'],
      recipients: ['admin@estoquemestre.com'],
    },
    {
      id: 'low_stock_alert',
      name: 'Low Stock Alert',
      description: 'Alert when low stock items exceed threshold',
      metric: 'low_stock_items',
      condition: 'gt',
      threshold: 20,
      severity: 'medium',
      enabled: true,
      cooldown: 30,
      notificationChannels: ['email', 'in_app'],
      recipients: ['manager@estoquemestre.com'],
    },
    {
      id: 'out_of_stock_alert',
      name: 'Out of Stock Alert',
      description: 'Alert when any items are out of stock',
      metric: 'out_of_stock_items',
      condition: 'gt',
      threshold: 0,
      severity: 'high',
      enabled: true,
      cooldown: 5,
      notificationChannels: ['email', 'in_app'],
      recipients: ['manager@estoquemestre.com'],
    },
    {
      id: 'system_unhealthy',
      name: 'System Unhealthy',
      description: 'Alert when system health is unhealthy',
      metric: 'system_health',
      condition: 'eq',
      threshold: 0,
      severity: 'critical',
      enabled: true,
      cooldown: 1,
      notificationChannels: ['email', 'in_app', 'webhook'],
      recipients: ['admin@estoquemestre.com', 'devops@estoquemestre.com'],
    },
    {
      id: 'high_memory_usage',
      name: 'High Memory Usage',
      description: 'Alert when memory usage exceeds 90%',
      metric: 'memory_usage_bytes',
      condition: 'gt',
      threshold: 0.9, // 90% of available memory
      severity: 'high',
      enabled: true,
      cooldown: 15,
      notificationChannels: ['email', 'in_app'],
      recipients: ['admin@estoquemestre.com'],
    },
    {
      id: 'database_connection_issues',
      name: 'Database Connection Issues',
      description: 'Alert when database connections are low',
      metric: 'database_connections',
      condition: 'lt',
      threshold: 5,
      severity: 'critical',
      enabled: true,
      cooldown: 5,
      notificationChannels: ['email', 'in_app', 'webhook'],
      recipients: ['admin@estoquemestre.com', 'dba@estoquemestre.com'],
    },
    {
      id: 'payment_failure_rate',
      name: 'Payment Failure Rate',
      description: 'Alert when payment failure rate is high',
      metric: 'payments_processed_total',
      condition: 'gt',
      threshold: 0.1, // 10% failure rate
      severity: 'high',
      enabled: true,
      cooldown: 10,
      notificationChannels: ['email', 'in_app'],
      recipients: ['finance@estoquemestre.com'],
    },
    {
      id: 'integration_sync_failures',
      name: 'Integration Sync Failures',
      description: 'Alert when integration sync failures exceed threshold',
      metric: 'integrations_sync_total',
      condition: 'gt',
      threshold: 5,
      severity: 'medium',
      enabled: true,
      cooldown: 20,
      notificationChannels: ['email', 'in_app'],
      recipients: ['integration@estoquemestre.com'],
    },
    {
      id: 'quality_inspection_failures',
      name: 'Quality Inspection Failures',
      description: 'Alert when quality inspection pass rate is low',
      metric: 'quality_inspection_pass_rate',
      condition: 'lt',
      threshold: 0.8, // 80% pass rate
      severity: 'medium',
      enabled: true,
      cooldown: 60,
      notificationChannels: ['email', 'in_app'],
      recipients: ['quality@estoquemestre.com'],
    },
  ];

  private activeAlerts = new Map<string, Alert>();
  private lastAlertTimes = new Map<string, Date>();

  constructor(
    private readonly metricsService: MetricsService,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Initialize alert monitoring
    this.startAlertMonitoring();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAlerts() {
    if (!this.alertRules.length) return;

    try {
      const metrics = await this.metricsService.getMetricsAsJson();
      
      for (const rule of this.alertRules) {
        if (!rule.enabled) continue;

        // Check cooldown
        const lastAlertTime = this.lastAlertTimes.get(rule.id);
        if (lastAlertTime) {
          const cooldownMs = rule.cooldown * 60 * 1000;
          if (Date.now() - lastAlertTime.getTime() < cooldownMs) {
            continue;
          }
        }

        // Find metric data
        const metricData = metrics.find((m: any) => m.name === rule.metric);
        if (!metricData || !metricData.values) continue;

        // Check each value against the rule
        for (const value of metricData.values) {
          if (this.evaluateCondition(value.value, rule.condition, rule.threshold)) {
            await this.triggerAlert(rule, value);
          }
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  private async triggerAlert(rule: AlertRule, metricValue: any) {
    const alertId = `${rule.id}_${Date.now()}`;
    const companyId = metricValue.labels?.company_id || 'system';

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, metricValue),
      metric: rule.metric,
      value: metricValue.value,
      threshold: rule.threshold,
      labels: metricValue.labels || {},
      triggeredAt: new Date(),
      companyId,
    };

    // Store active alert
    this.activeAlerts.set(alertId, alert);
    this.lastAlertTimes.set(rule.id, new Date());

    // Send notifications
    await this.sendAlertNotifications(alert, rule);

    // Log alert
    console.log(`Alert triggered: ${rule.name} - ${alert.message}`);
  }

  private generateAlertMessage(rule: AlertRule, metricValue: any): string {
    const labels = metricValue.labels || {};
    const companyId = labels.company_id || 'system';
    const component = labels.component || labels.route || 'unknown';

    switch (rule.id) {
      case 'high_error_rate':
        return `High error rate detected: ${metricValue.value} errors in ${component}`;
      case 'slow_response_time':
        return `Slow response time: ${metricValue.value}s for ${component}`;
      case 'low_stock_alert':
        return `Low stock alert: ${metricValue.value} items with low stock in ${labels.category || 'all categories'}`;
      case 'out_of_stock_alert':
        return `Out of stock alert: ${metricValue.value} items out of stock in ${labels.category || 'all categories'}`;
      case 'system_unhealthy':
        return `System component unhealthy: ${component}`;
      case 'high_memory_usage':
        return `High memory usage: ${(metricValue.value * 100).toFixed(1)}%`;
      case 'database_connection_issues':
        return `Database connection issues: only ${metricValue.value} connections available`;
      case 'payment_failure_rate':
        return `Payment failure rate high: ${(metricValue.value * 100).toFixed(1)}%`;
      case 'integration_sync_failures':
        return `Integration sync failures: ${metricValue.value} failed syncs for ${labels.integration_id || 'unknown integration'}`;
      case 'quality_inspection_failures':
        return `Quality inspection pass rate low: ${(metricValue.value * 100).toFixed(1)}%`;
      default:
        return `${rule.name}: ${metricValue.value} ${rule.condition} ${rule.threshold}`;
    }
  }

  private async sendAlertNotifications(alert: Alert, rule: AlertRule) {
    const promises: Promise<any>[] = [];

    // In-app notifications
    if (rule.notificationChannels.includes('in_app')) {
      promises.push(this.sendInAppNotification(alert, rule));
    }

    // Email notifications
    if (rule.notificationChannels.includes('email')) {
      promises.push(this.sendEmailNotification(alert, rule));
    }

    // Webhook notifications
    if (rule.notificationChannels.includes('webhook')) {
      promises.push(this.sendWebhookNotification(alert, rule));
    }

    await Promise.allSettled(promises);
  }

  private async sendInAppNotification(alert: Alert, rule: AlertRule) {
    try {
      // Create in-app notification for all users in the company
      const users = await this.prisma.user.findMany({
        where: { companyId: alert.companyId },
        select: { id: true },
      });

      for (const user of users) {
        await this.notificationService.create({
          title: rule.name,
          message: alert.message,
          type: 'SYSTEM_MAINTENANCE',
          priority: this.mapSeverityToPriority(alert.severity),
          data: {
            alertId: alert.id,
            ruleId: rule.id,
            severity: alert.severity,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
          },
        }, alert.companyId, user.id);
      }
    } catch (error) {
      console.error('Error sending in-app notification:', error);
    }
  }

  private async sendEmailNotification(alert: Alert, rule: AlertRule) {
    try {
      const subject = `[${alert.severity.toUpperCase()}] ${rule.name} - Estoque Mestre`;
      const html = this.generateEmailTemplate(alert, rule);

      for (const recipient of rule.recipients) {
        await this.emailService.sendNotificationEmail({
          name: 'Admin',
          email: recipient,
          title: subject,
          message: alert.message,
          priority: alert.severity as any,
        });
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  private async sendWebhookNotification(alert: Alert, rule: AlertRule) {
    try {
      // This would integrate with external monitoring systems
      // For now, just log the webhook payload
      const webhookPayload = {
        alert,
        rule,
        timestamp: new Date().toISOString(),
        source: 'estoque_mestre_alerts',
      };

      console.log('Webhook notification payload:', JSON.stringify(webhookPayload, null, 2));
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }
  }

  private generateEmailTemplate(alert: Alert, rule: AlertRule): string {
    const severityColor = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545',
    }[alert.severity];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Alert: ${rule.name}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${severityColor}; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">${rule.name}</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Severity: ${alert.severity.toUpperCase()}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #495057;">Alert Details</h2>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Metric:</strong> ${alert.metric}</p>
            <p><strong>Current Value:</strong> ${alert.value}</p>
            <p><strong>Threshold:</strong> ${alert.threshold}</p>
            <p><strong>Triggered At:</strong> ${alert.triggeredAt.toISOString()}</p>
            <p><strong>Company ID:</strong> ${alert.companyId}</p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px;">
            <h3 style="margin-top: 0;">Description</h3>
            <p>${rule.description}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
            <p>This alert was generated automatically by the Estoque Mestre monitoring system.</p>
            <p>Please investigate and take appropriate action if necessary.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private mapSeverityToPriority(severity: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    switch (severity) {
      case 'low': return 'LOW';
      case 'medium': return 'MEDIUM';
      case 'high': return 'HIGH';
      case 'critical': return 'URGENT';
      default: return 'MEDIUM';
    }
  }

  private startAlertMonitoring() {
    console.log('Alert monitoring started with', this.alertRules.length, 'rules');
  }

  // ===== PUBLIC METHODS =====

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.activeAlerts.values());
  }

  async getAlertRules(): Promise<AlertRule[]> {
    return this.alertRules;
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = userId;
      this.activeAlerts.set(alertId, alert);
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      this.activeAlerts.set(alertId, alert);
    }
  }

  async addAlertRule(rule: AlertRule): Promise<void> {
    this.alertRules.push(rule);
  }

  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.alertRules[index] = { ...this.alertRules[index], ...updates };
    }
  }

  async deleteAlertRule(ruleId: string): Promise<void> {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.alertRules.splice(index, 1);
    }
  }
}
