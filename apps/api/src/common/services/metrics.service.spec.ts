import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordHttpRequest', () => {
    it('should record HTTP request metrics', () => {
      // Arrange
      const method = 'GET';
      const route = '/api/products';
      const statusCode = 200;
      const duration = 0.5;
      const companyId = 'company-1';

      // Act
      service.recordHttpRequest(method, route, statusCode, duration, companyId);

      // Assert
      // Since we're using prom-client, we can't easily test the internal state
      // but we can verify the method doesn't throw
      expect(() => {
        service.recordHttpRequest(method, route, statusCode, duration, companyId);
      }).not.toThrow();
    });
  });

  describe('recordBusinessOperation', () => {
    it('should record business operation metrics', () => {
      // Arrange
      const operation = 'create_product';
      const duration = 1.2;
      const companyId = 'company-1';
      const userId = 'user-1';
      const status = 'success' as const;

      // Act & Assert
      expect(() => {
        service.recordBusinessOperation(operation, duration, companyId, userId, status);
      }).not.toThrow();
    });
  });

  describe('recordError', () => {
    it('should record error metrics', () => {
      // Arrange
      const errorType = 'ValidationError';
      const module = 'ProductModule';
      const companyId = 'company-1';
      const severity = 'medium' as const;

      // Act & Assert
      expect(() => {
        service.recordError(errorType, module, companyId, severity);
      }).not.toThrow();
    });
  });

  describe('recordDatabaseQuery', () => {
    it('should record database query metrics', () => {
      // Arrange
      const operation = 'SELECT';
      const table = 'products';
      const duration = 0.1;
      const companyId = 'company-1';

      // Act & Assert
      expect(() => {
        service.recordDatabaseQuery(operation, table, duration, companyId);
      }).not.toThrow();
    });
  });

  describe('recordNotification', () => {
    it('should record notification metrics', () => {
      // Arrange
      const type = 'email';
      const channel = 'smtp';
      const companyId = 'company-1';
      const status = 'sent' as const;

      // Act & Assert
      expect(() => {
        service.recordNotification(type, channel, companyId, status);
      }).not.toThrow();
    });
  });

  describe('recordIntegrationSync', () => {
    it('should record integration sync metrics', () => {
      // Arrange
      const integrationId = 'integration-1';
      const companyId = 'company-1';
      const entity = 'products';
      const status = 'success' as const;
      const duration = 5.5;

      // Act & Assert
      expect(() => {
        service.recordIntegrationSync(integrationId, companyId, entity, status, duration);
      }).not.toThrow();
    });
  });

  describe('recordPayment', () => {
    it('should record payment metrics', () => {
      // Arrange
      const paymentMethod = 'credit_card';
      const companyId = 'company-1';
      const status = 'success' as const;
      const amount = 150.00;

      // Act & Assert
      expect(() => {
        service.recordPayment(paymentMethod, companyId, status, amount);
      }).not.toThrow();
    });
  });

  describe('updateInventoryMetrics', () => {
    it('should update inventory metrics', () => {
      // Arrange
      const companyId = 'company-1';
      const category = 'electronics';
      const value = 50000;
      const lowStockCount = 5;
      const outOfStockCount = 2;

      // Act & Assert
      expect(() => {
        service.updateInventoryMetrics(companyId, category, value, lowStockCount, outOfStockCount);
      }).not.toThrow();
    });
  });

  describe('updateSystemHealth', () => {
    it('should update system health metrics', () => {
      // Arrange
      const component = 'database';
      const isHealthy = true;

      // Act & Assert
      expect(() => {
        service.updateSystemHealth(component, isHealthy);
      }).not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should return metrics in Prometheus format', async () => {
      // Act
      const result = await service.getMetrics();

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('# HELP');
      expect(result).toContain('# TYPE');
    });
  });

  describe('getMetricsAsJson', () => {
    it('should return metrics in JSON format', async () => {
      // Act
      const result = await service.getMetricsAsJson();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that each metric has required properties
      result.forEach(metric => {
        expect(metric).toHaveProperty('name');
        expect(metric).toHaveProperty('help');
        expect(metric).toHaveProperty('type');
      });
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      // Act & Assert
      expect(() => {
        service.clearMetrics();
      }).not.toThrow();
    });
  });

  describe('onModuleInit', () => {
    it('should initialize metrics collection', () => {
      // Act & Assert
      expect(() => {
        service.onModuleInit();
      }).not.toThrow();
    });
  });
});
