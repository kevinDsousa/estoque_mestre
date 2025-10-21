import { Injectable, OnModuleInit } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register = register;

  // ===== COUNTERS =====
  public readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'company_id'],
  });

  public readonly businessOperationsTotal = new Counter({
    name: 'business_operations_total',
    help: 'Total number of business operations',
    labelNames: ['operation', 'company_id', 'user_id', 'status'],
  });

  public readonly errorsTotal = new Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['error_type', 'module', 'company_id', 'severity'],
  });

  public readonly notificationsSentTotal = new Counter({
    name: 'notifications_sent_total',
    help: 'Total number of notifications sent',
    labelNames: ['type', 'channel', 'company_id', 'status'],
  });

  public readonly integrationsSyncTotal = new Counter({
    name: 'integrations_sync_total',
    help: 'Total number of integration syncs',
    labelNames: ['integration_id', 'company_id', 'entity', 'status'],
  });

  public readonly paymentsProcessedTotal = new Counter({
    name: 'payments_processed_total',
    help: 'Total number of payments processed',
    labelNames: ['payment_method', 'company_id', 'status', 'amount_range'],
  });

  // ===== GAUGES =====
  public readonly activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
    labelNames: ['company_id'],
  });

  public readonly inventoryValue = new Gauge({
    name: 'inventory_value',
    help: 'Total inventory value',
    labelNames: ['company_id', 'category'],
  });

  public readonly lowStockItems = new Gauge({
    name: 'low_stock_items',
    help: 'Number of items with low stock',
    labelNames: ['company_id', 'category'],
  });

  public readonly outOfStockItems = new Gauge({
    name: 'out_of_stock_items',
    help: 'Number of out of stock items',
    labelNames: ['company_id', 'category'],
  });

  public readonly pendingOrders = new Gauge({
    name: 'pending_orders',
    help: 'Number of pending orders',
    labelNames: ['company_id', 'type'],
  });

  public readonly systemHealth = new Gauge({
    name: 'system_health',
    help: 'System health status (1 = healthy, 0 = unhealthy)',
    labelNames: ['component'],
  });

  public readonly databaseConnections = new Gauge({
    name: 'database_connections',
    help: 'Number of active database connections',
  });

  public readonly cacheHitRate = new Gauge({
    name: 'cache_hit_rate',
    help: 'Cache hit rate percentage',
    labelNames: ['cache_type'],
  });

  // ===== HISTOGRAMS =====
  public readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code', 'company_id'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  });

  public readonly databaseQueryDuration = new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table', 'company_id'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  });

  public readonly businessOperationDuration = new Histogram({
    name: 'business_operation_duration_seconds',
    help: 'Duration of business operations in seconds',
    labelNames: ['operation', 'company_id'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  });

  public readonly emailSendDuration = new Histogram({
    name: 'email_send_duration_seconds',
    help: 'Duration of email sending in seconds',
    labelNames: ['type', 'company_id'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  });

  public readonly fileUploadDuration = new Histogram({
    name: 'file_upload_duration_seconds',
    help: 'Duration of file uploads in seconds',
    labelNames: ['file_type', 'company_id'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  });

  // ===== SUMMARIES =====
  public readonly salesAmount = new Summary({
    name: 'sales_amount',
    help: 'Sales amount summary',
    labelNames: ['company_id', 'period'],
    percentiles: [0.5, 0.9, 0.95, 0.99],
  });

  public readonly orderValue = new Summary({
    name: 'order_value',
    help: 'Order value summary',
    labelNames: ['company_id', 'type'],
    percentiles: [0.5, 0.9, 0.95, 0.99],
  });

  public readonly customerLifetimeValue = new Summary({
    name: 'customer_lifetime_value',
    help: 'Customer lifetime value summary',
    labelNames: ['company_id'],
    percentiles: [0.5, 0.9, 0.95, 0.99],
  });

  // ===== CUSTOM METRICS =====
  public readonly productViews = new Counter({
    name: 'product_views_total',
    help: 'Total number of product views',
    labelNames: ['product_id', 'company_id', 'user_type'],
  });

  public readonly searchQueries = new Counter({
    name: 'search_queries_total',
    help: 'Total number of search queries',
    labelNames: ['query_type', 'company_id', 'result_count_range'],
  });

  public readonly apiRateLimitHits = new Counter({
    name: 'api_rate_limit_hits_total',
    help: 'Total number of API rate limit hits',
    labelNames: ['endpoint', 'company_id', 'user_id'],
  });

  public readonly webhookDeliveries = new Counter({
    name: 'webhook_deliveries_total',
    help: 'Total number of webhook deliveries',
    labelNames: ['webhook_id', 'company_id', 'status', 'retry_count'],
  });

  public readonly dataSyncLatency = new Histogram({
    name: 'data_sync_latency_seconds',
    help: 'Data synchronization latency in seconds',
    labelNames: ['integration_id', 'company_id', 'entity_type'],
    buckets: [1, 5, 10, 30, 60, 300, 600, 1800],
  });

  public readonly qualityInspectionPassRate = new Gauge({
    name: 'quality_inspection_pass_rate',
    help: 'Quality inspection pass rate percentage',
    labelNames: ['company_id', 'product_category'],
  });

  public readonly supplierPerformance = new Gauge({
    name: 'supplier_performance_score',
    help: 'Supplier performance score (0-100)',
    labelNames: ['supplier_id', 'company_id', 'metric_type'],
  });

  public readonly customerSatisfaction = new Gauge({
    name: 'customer_satisfaction_score',
    help: 'Customer satisfaction score (0-100)',
    labelNames: ['company_id', 'customer_segment'],
  });

  public readonly systemUptime = new Gauge({
    name: 'system_uptime_seconds',
    help: 'System uptime in seconds',
  });

  public readonly memoryUsage = new Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
  });

  public readonly cpuUsage = new Gauge({
    name: 'cpu_usage_percent',
    help: 'CPU usage percentage',
  });

  public readonly diskUsage = new Gauge({
    name: 'disk_usage_percent',
    help: 'Disk usage percentage',
    labelNames: ['mount_point'],
  });

  onModuleInit() {
    // Temporarily disabled to debug startup issue
    console.log('[DEBUG] MetricsService onModuleInit - disabled for debugging');
    /*
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({
      register: this.register,
      prefix: 'estoque_mestre_',
    });

    // Initialize system uptime
    this.systemUptime.set(process.uptime());
    
    // Update system metrics every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);
    */
  }

  private updateSystemMetrics() {
    // Update system uptime
    this.systemUptime.set(process.uptime());

    // Update memory usage
    const memUsage = process.memoryUsage();
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);

    // Update CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    this.cpuUsage.set(totalCpuTime / 1000000); // Convert to seconds
  }

  // ===== HELPER METHODS =====

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number, companyId?: string) {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      company_id: companyId || 'unknown',
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, duration);
  }

  /**
   * Record business operation metrics
   */
  recordBusinessOperation(operation: string, duration: number, companyId: string, userId: string, status: 'success' | 'error') {
    const labels = {
      operation,
      company_id: companyId,
      user_id: userId,
      status,
    };

    this.businessOperationsTotal.inc(labels);
    this.businessOperationDuration.observe(labels, duration);
  }

  /**
   * Record error metrics
   */
  recordError(errorType: string, module: string, companyId: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    this.errorsTotal.inc({
      error_type: errorType,
      module,
      company_id: companyId,
      severity,
    });
  }

  /**
   * Record database query metrics
   */
  recordDatabaseQuery(operation: string, table: string, duration: number, companyId: string) {
    this.databaseQueryDuration.observe({
      operation,
      table,
      company_id: companyId,
    }, duration);
  }

  /**
   * Record notification metrics
   */
  recordNotification(type: string, channel: string, companyId: string, status: 'sent' | 'failed') {
    this.notificationsSentTotal.inc({
      type,
      channel,
      company_id: companyId,
      status,
    });
  }

  /**
   * Record integration sync metrics
   */
  recordIntegrationSync(integrationId: string, companyId: string, entity: string, status: 'success' | 'failed', duration?: number) {
    this.integrationsSyncTotal.inc({
      integration_id: integrationId,
      company_id: companyId,
      entity,
      status,
    });

    if (duration) {
      this.dataSyncLatency.observe({
        integration_id: integrationId,
        company_id: companyId,
        entity_type: entity,
      }, duration);
    }
  }

  /**
   * Record payment metrics
   */
  recordPayment(paymentMethod: string, companyId: string, status: 'success' | 'failed', amount: number) {
    const amountRange = this.getAmountRange(amount);
    
    this.paymentsProcessedTotal.inc({
      payment_method: paymentMethod,
      company_id: companyId,
      status,
      amount_range: amountRange,
    });
  }

  /**
   * Update inventory metrics
   */
  updateInventoryMetrics(companyId: string, category: string, value: number, lowStockCount: number, outOfStockCount: number) {
    this.inventoryValue.set({ company_id: companyId, category }, value);
    this.lowStockItems.set({ company_id: companyId, category }, lowStockCount);
    this.outOfStockItems.set({ company_id: companyId, category }, outOfStockCount);
  }

  /**
   * Update system health metrics
   */
  updateSystemHealth(component: string, isHealthy: boolean) {
    this.systemHealth.set({ component }, isHealthy ? 1 : 0);
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Get metrics in JSON format
   */
  async getMetricsAsJson(): Promise<any> {
    return this.register.getMetricsAsJSON();
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.register.clear();
  }

  private getAmountRange(amount: number): string {
    if (amount < 100) return '0-100';
    if (amount < 500) return '100-500';
    if (amount < 1000) return '500-1000';
    if (amount < 5000) return '1000-5000';
    if (amount < 10000) return '5000-10000';
    return '10000+';
  }
}
