import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

export interface CachedMetrics {
  timestamp: Date;
  data: any;
  ttl: number;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalTransactions: number;
  totalRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  expiringProducts: number;
  recentActivities: any[];
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: any[];
  salesByPeriod: any[];
  salesByCategory: any[];
}

export interface InventoryMetrics {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  topCategories: any[];
  inventoryByLocation: any[];
}

@Injectable()
export class MetricsCacheService {
  private readonly metricsTtl: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.metricsTtl = (this.configService.get<number>('redis.cache.metrics') || 300) * 1000;
  }

  /**
   * Cache de métricas do dashboard
   */
  async getDashboardMetrics(companyId: string): Promise<DashboardMetrics | null> {
    const cacheKey = `dashboard:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setDashboardMetrics(companyId: string, metrics: DashboardMetrics): Promise<void> {
    const cacheKey = `dashboard:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de vendas
   */
  async getSalesMetrics(companyId: string, period: string): Promise<SalesMetrics | null> {
    const cacheKey = `sales:metrics:${companyId}:${period}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setSalesMetrics(companyId: string, period: string, metrics: SalesMetrics): Promise<void> {
    const cacheKey = `sales:metrics:${companyId}:${period}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de estoque
   */
  async getInventoryMetrics(companyId: string): Promise<InventoryMetrics | null> {
    const cacheKey = `inventory:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setInventoryMetrics(companyId: string, metrics: InventoryMetrics): Promise<void> {
    const cacheKey = `inventory:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de relatórios
   */
  async getReport(reportType: string, companyId: string, params: any): Promise<any | null> {
    const cacheKey = `report:${reportType}:${companyId}:${JSON.stringify(params)}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setReport(reportType: string, companyId: string, params: any, data: any): Promise<void> {
    const cacheKey = `report:${reportType}:${companyId}:${JSON.stringify(params)}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas em tempo real
   */
  async updateRealTimeMetric(companyId: string, metric: string, value: number): Promise<void> {
    const key = `metrics:realtime:${companyId}:${metric}`;
    const current = await this.cacheManager.get<number>(key) || 0;
    await this.cacheManager.set(key, current + value, this.metricsTtl);
  }

  async getRealTimeMetric(companyId: string, metric: string): Promise<number> {
    const key = `metrics:realtime:${companyId}:${metric}`;
    return await this.cacheManager.get<number>(key) || 0;
  }

  /**
   * Cache de métricas de performance
   */
  async getPerformanceMetrics(companyId: string): Promise<any | null> {
    const cacheKey = `performance:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setPerformanceMetrics(companyId: string, metrics: any): Promise<void> {
    const cacheKey = `performance:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de usuários
   */
  async getUserMetrics(companyId: string): Promise<any | null> {
    const cacheKey = `user:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setUserMetrics(companyId: string, metrics: any): Promise<void> {
    const cacheKey = `user:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de transações
   */
  async getTransactionMetrics(companyId: string, period: string): Promise<any | null> {
    const cacheKey = `transaction:metrics:${companyId}:${period}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setTransactionMetrics(companyId: string, period: string, metrics: any): Promise<void> {
    const cacheKey = `transaction:metrics:${companyId}:${period}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de produtos
   */
  async getProductMetrics(companyId: string): Promise<any | null> {
    const cacheKey = `product:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setProductMetrics(companyId: string, metrics: any): Promise<void> {
    const cacheKey = `product:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de categorias
   */
  async getCategoryMetrics(companyId: string): Promise<any | null> {
    const cacheKey = `category:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setCategoryMetrics(companyId: string, metrics: any): Promise<void> {
    const cacheKey = `category:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de fornecedores
   */
  async getSupplierMetrics(companyId: string): Promise<any | null> {
    const cacheKey = `supplier:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setSupplierMetrics(companyId: string, metrics: any): Promise<void> {
    const cacheKey = `supplier:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Cache de métricas de clientes
   */
  async getCustomerMetrics(companyId: string): Promise<any | null> {
    const cacheKey = `customer:metrics:${companyId}`;
    const cached = await this.cacheManager.get<CachedMetrics>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setCustomerMetrics(companyId: string, metrics: any): Promise<void> {
    const cacheKey = `customer:metrics:${companyId}`;
    const cached: CachedMetrics = {
      timestamp: new Date(),
      data: metrics,
      ttl: this.metricsTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.metricsTtl);
  }

  /**
   * Invalidação de cache de métricas
   */
  async invalidateCompanyMetrics(companyId: string): Promise<void> {
    const patterns = [
      `dashboard:metrics:${companyId}`,
      `sales:metrics:${companyId}:*`,
      `inventory:metrics:${companyId}`,
      `performance:metrics:${companyId}`,
      `user:metrics:${companyId}`,
      `transaction:metrics:${companyId}:*`,
      `product:metrics:${companyId}`,
      `category:metrics:${companyId}`,
      `supplier:metrics:${companyId}`,
      `customer:metrics:${companyId}`,
      `report:*:${companyId}:*`,
      `metrics:realtime:${companyId}:*`,
    ];
    
    for (const pattern of patterns) {
      await this.cacheManager.del(pattern);
    }
  }

  /**
   * Invalidação de cache de relatórios
   */
  async invalidateReports(companyId: string, reportType?: string): Promise<void> {
    if (reportType) {
      await this.cacheManager.del(`report:${reportType}:${companyId}:*`);
    } else {
      await this.cacheManager.del(`report:*:${companyId}:*`);
    }
  }

  /**
   * Verifica se o cache é válido
   */
  private isCacheValid(cached: CachedMetrics): boolean {
    const now = new Date();
    const cacheAge = now.getTime() - cached.timestamp.getTime();
    return cacheAge < cached.ttl;
  }

  /**
   * Obtém estatísticas do cache de métricas
   */
  async getCacheStats(): Promise<{
    totalCachedMetrics: number;
    cacheHitRate: number;
    averageCacheAge: number;
  }> {
    // Implementação simplificada
    return {
      totalCachedMetrics: 0,
      cacheHitRate: 0,
      averageCacheAge: 0,
    };
  }

  /**
   * Limpa cache de métricas antigas
   */
  async cleanOldMetrics(): Promise<void> {
    // Implementação simplificada
    // Em produção, você usaria SCAN do Redis para encontrar e remover métricas antigas
  }
}
