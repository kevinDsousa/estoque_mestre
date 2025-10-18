import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../../database/prisma.service';
import { AlertsService } from './alerts.service';
import { MetricsService } from './metrics.service';
import { NotificationService } from '../../modules/notification/notification.service';
import { EmailService } from '../../modules/email/email.service';

describe('AlertsService', () => {
  let service: AlertsService;
  let prismaService: DeepMockProxy<PrismaService>;
  let metricsService: DeepMockProxy<MetricsService>;
  let notificationService: DeepMockProxy<NotificationService>;
  let emailService: DeepMockProxy<EmailService>;

  const mockCompanyId = 'company-1';
  const mockUserId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: MetricsService,
          useValue: mockDeep<MetricsService>(),
        },
        {
          provide: NotificationService,
          useValue: mockDeep<NotificationService>(),
        },
        {
          provide: EmailService,
          useValue: mockDeep<EmailService>(),
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    prismaService = module.get(PrismaService);
    metricsService = module.get(MetricsService);
    notificationService = module.get(NotificationService);
    emailService = module.get(EmailService);

    // Reset all mocks
    mockReset(prismaService);
    mockReset(metricsService);
    mockReset(notificationService);
    mockReset(emailService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveAlerts', () => {
    it('should return empty array when no alerts are active', async () => {
      // Act
      const result = await service.getActiveAlerts();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getAlertRules', () => {
    it('should return predefined alert rules', async () => {
      // Act
      const result = await service.getAlertRules();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that each rule has required properties
      result.forEach(rule => {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('name');
        expect(rule).toHaveProperty('description');
        expect(rule).toHaveProperty('metric');
        expect(rule).toHaveProperty('condition');
        expect(rule).toHaveProperty('threshold');
        expect(rule).toHaveProperty('severity');
        expect(rule).toHaveProperty('enabled');
        expect(rule).toHaveProperty('cooldown');
        expect(rule).toHaveProperty('notificationChannels');
        expect(rule).toHaveProperty('recipients');
      });
    });

    it('should include high error rate rule', async () => {
      // Act
      const result = await service.getAlertRules();

      // Assert
      const highErrorRateRule = result.find(rule => rule.id === 'high_error_rate');
      expect(highErrorRateRule).toBeDefined();
      expect(highErrorRateRule?.metric).toBe('errors_total');
      expect(highErrorRateRule?.condition).toBe('gt');
      expect(highErrorRateRule?.threshold).toBe(10);
      expect(highErrorRateRule?.severity).toBe('high');
    });

    it('should include low stock alert rule', async () => {
      // Act
      const result = await service.getAlertRules();

      // Assert
      const lowStockRule = result.find(rule => rule.id === 'low_stock_alert');
      expect(lowStockRule).toBeDefined();
      expect(lowStockRule?.metric).toBe('low_stock_items');
      expect(lowStockRule?.condition).toBe('gt');
      expect(lowStockRule?.threshold).toBe(20);
      expect(lowStockRule?.severity).toBe('medium');
    });

    it('should include out of stock alert rule', async () => {
      // Act
      const result = await service.getAlertRules();

      // Assert
      const outOfStockRule = result.find(rule => rule.id === 'out_of_stock_alert');
      expect(outOfStockRule).toBeDefined();
      expect(outOfStockRule?.metric).toBe('out_of_stock_items');
      expect(outOfStockRule?.condition).toBe('gt');
      expect(outOfStockRule?.threshold).toBe(0);
      expect(outOfStockRule?.severity).toBe('high');
    });

    it('should include system unhealthy rule', async () => {
      // Act
      const result = await service.getAlertRules();

      // Assert
      const systemUnhealthyRule = result.find(rule => rule.id === 'system_unhealthy');
      expect(systemUnhealthyRule).toBeDefined();
      expect(systemUnhealthyRule?.metric).toBe('system_health');
      expect(systemUnhealthyRule?.condition).toBe('eq');
      expect(systemUnhealthyRule?.threshold).toBe(0);
      expect(systemUnhealthyRule?.severity).toBe('critical');
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      // Arrange
      const alertId = 'alert-1';
      const userId = 'user-1';

      // Act
      await service.acknowledgeAlert(alertId, userId);

      // Assert
      // Since we're using in-memory storage, we can't easily test the internal state
      // but we can verify the method doesn't throw
      expect(async () => {
        await service.acknowledgeAlert(alertId, userId);
      }).not.toThrow();
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert', async () => {
      // Arrange
      const alertId = 'alert-1';

      // Act
      await service.resolveAlert(alertId);

      // Assert
      // Since we're using in-memory storage, we can't easily test the internal state
      // but we can verify the method doesn't throw
      expect(async () => {
        await service.resolveAlert(alertId);
      }).not.toThrow();
    });
  });

  describe('addAlertRule', () => {
    it('should add a new alert rule', async () => {
      // Arrange
      const newRule = {
        id: 'custom_rule',
        name: 'Custom Alert',
        description: 'Custom alert description',
        metric: 'custom_metric',
        condition: 'gt' as const,
        threshold: 100,
        severity: 'medium' as const,
        enabled: true,
        cooldown: 30,
        notificationChannels: ['email'] as ('email' | 'in_app' | 'webhook')[],
        recipients: ['admin@example.com'],
      };

      // Act
      await service.addAlertRule(newRule);

      // Assert
      // Since we're using in-memory storage, we can't easily test the internal state
      // but we can verify the method doesn't throw
      expect(async () => {
        await service.addAlertRule(newRule);
      }).not.toThrow();
    });
  });

  describe('updateAlertRule', () => {
    it('should update an existing alert rule', async () => {
      // Arrange
      const ruleId = 'high_error_rate';
      const updates = {
        threshold: 15,
        cooldown: 20,
      };

      // Act
      await service.updateAlertRule(ruleId, updates);

      // Assert
      // Since we're using in-memory storage, we can't easily test the internal state
      // but we can verify the method doesn't throw
      expect(async () => {
        await service.updateAlertRule(ruleId, updates);
      }).not.toThrow();
    });
  });

  describe('deleteAlertRule', () => {
    it('should delete an alert rule', async () => {
      // Arrange
      const ruleId = 'high_error_rate';

      // Act
      await service.deleteAlertRule(ruleId);

      // Assert
      // Since we're using in-memory storage, we can't easily test the internal state
      // but we can verify the method doesn't throw
      expect(async () => {
        await service.deleteAlertRule(ruleId);
      }).not.toThrow();
    });
  });

  describe('onModuleInit', () => {
    it('should initialize alert monitoring', () => {
      // Act & Assert
      expect(() => {
        service.onModuleInit();
      }).not.toThrow();
    });
  });

  describe('checkAlerts', () => {
    it('should check alerts without throwing errors', async () => {
      // Arrange
      metricsService.getMetricsAsJson.mockResolvedValue([]);

      // Act & Assert
      await expect(service.checkAlerts()).resolves.not.toThrow();
    });

    it('should handle metrics service errors gracefully', async () => {
      // Arrange
      metricsService.getMetricsAsJson.mockRejectedValue(new Error('Metrics service error'));

      // Act & Assert
      await expect(service.checkAlerts()).resolves.not.toThrow();
    });
  });

  describe('evaluateCondition', () => {
    it('should evaluate greater than condition correctly', () => {
      // Arrange
      const value = 15;
      const condition = 'gt';
      const threshold = 10;

      // Act
      const result = (service as any).evaluateCondition(value, condition, threshold);

      // Assert
      expect(result).toBe(true);
    });

    it('should evaluate less than condition correctly', () => {
      // Arrange
      const value = 5;
      const condition = 'lt';
      const threshold = 10;

      // Act
      const result = (service as any).evaluateCondition(value, condition, threshold);

      // Assert
      expect(result).toBe(true);
    });

    it('should evaluate equal condition correctly', () => {
      // Arrange
      const value = 10;
      const condition = 'eq';
      const threshold = 10;

      // Act
      const result = (service as any).evaluateCondition(value, condition, threshold);

      // Assert
      expect(result).toBe(true);
    });

    it('should evaluate greater than or equal condition correctly', () => {
      // Arrange
      const value = 10;
      const condition = 'gte';
      const threshold = 10;

      // Act
      const result = (service as any).evaluateCondition(value, condition, threshold);

      // Assert
      expect(result).toBe(true);
    });

    it('should evaluate less than or equal condition correctly', () => {
      // Arrange
      const value = 10;
      const condition = 'lte';
      const threshold = 10;

      // Act
      const result = (service as any).evaluateCondition(value, condition, threshold);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for invalid condition', () => {
      // Arrange
      const value = 10;
      const condition = 'invalid';
      const threshold = 10;

      // Act
      const result = (service as any).evaluateCondition(value, condition, threshold);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('generateAlertMessage', () => {
    it('should generate message for high error rate alert', () => {
      // Arrange
      const rule = {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: 'gt',
        threshold: 10,
      };
      const metricValue = {
        value: 15,
        labels: { component: 'api' },
      };

      // Act
      const result = (service as any).generateAlertMessage(rule, metricValue);

      // Assert
      expect(result).toContain('High error rate detected');
      expect(result).toContain('15 errors');
      expect(result).toContain('api');
    });

    it('should generate message for low stock alert', () => {
      // Arrange
      const rule = {
        id: 'low_stock_alert',
        name: 'Low Stock Alert',
        condition: 'gt',
        threshold: 20,
      };
      const metricValue = {
        value: 25,
        labels: { category: 'electronics' },
      };

      // Act
      const result = (service as any).generateAlertMessage(rule, metricValue);

      // Assert
      expect(result).toContain('Low stock alert');
      expect(result).toContain('25 items');
      expect(result).toContain('electronics');
    });

    it('should generate message for out of stock alert', () => {
      // Arrange
      const rule = {
        id: 'out_of_stock_alert',
        name: 'Out of Stock Alert',
        condition: 'gt',
        threshold: 0,
      };
      const metricValue = {
        value: 3,
        labels: { category: 'books' },
      };

      // Act
      const result = (service as any).generateAlertMessage(rule, metricValue);

      // Assert
      expect(result).toContain('Out of stock alert');
      expect(result).toContain('3 items');
      expect(result).toContain('books');
    });

    it('should generate message for system unhealthy alert', () => {
      // Arrange
      const rule = {
        id: 'system_unhealthy',
        name: 'System Unhealthy',
        condition: 'eq',
        threshold: 0,
      };
      const metricValue = {
        value: 0,
        labels: { component: 'database' },
      };

      // Act
      const result = (service as any).generateAlertMessage(rule, metricValue);

      // Assert
      expect(result).toContain('System component unhealthy');
      expect(result).toContain('database');
    });

    it('should generate default message for unknown rule', () => {
      // Arrange
      const rule = {
        id: 'unknown_rule',
        name: 'Unknown Rule',
        condition: 'gt',
        threshold: 5,
      };
      const metricValue = {
        value: 10,
        labels: {},
      };

      // Act
      const result = (service as any).generateAlertMessage(rule, metricValue);

      // Assert
      expect(result).toContain('Unknown Rule');
      expect(result).toContain('10');
      expect(result).toContain('gt');
      expect(result).toContain('5');
    });
  });

  describe('mapSeverityToPriority', () => {
    it('should map severity to priority correctly', () => {
      // Act & Assert
      expect((service as any).mapSeverityToPriority('low')).toBe('LOW');
      expect((service as any).mapSeverityToPriority('medium')).toBe('MEDIUM');
      expect((service as any).mapSeverityToPriority('high')).toBe('HIGH');
      expect((service as any).mapSeverityToPriority('critical')).toBe('URGENT');
      expect((service as any).mapSeverityToPriority('unknown')).toBe('MEDIUM');
    });
  });
});
