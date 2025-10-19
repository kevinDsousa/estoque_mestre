import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  supplierId?: string;
  customerId?: string;
  userId?: string;
  status?: string;
  type?: string;
  format?: 'pdf' | 'excel' | 'csv';
}

export interface ReportData {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
  parameters: any;
}

export interface DashboardData {
  summary: {
    totalProducts: number;
    totalCustomers: number;
    totalSuppliers: number;
    totalTransactions: number;
    totalRevenue: number;
    totalCost: number;
    profit: number;
  };
  charts: {
    salesByMonth: any[];
    topProducts: any[];
    topCustomers: any[];
    inventoryStatus: any[];
    revenueByCategory: any[];
  };
  alerts: {
    lowStock: number;
    pendingOrders: number;
    overduePayments: number;
    expiringProducts: number;
  };
}

export interface AnalyticsData {
  period: string;
  metrics: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    transactions: number;
    averageOrderValue: number;
  };
  trends: {
    revenue: number;
    cost: number;
    profit: number;
    transactions: number;
  };
  comparisons: {
    previousPeriod: any;
    yearOverYear: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private reportsSubject = new BehaviorSubject<ReportData[]>([]);
  public reports$ = this.reportsSubject.asObservable();

  private dashboardDataSubject = new BehaviorSubject<DashboardData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  private analyticsDataSubject = new BehaviorSubject<AnalyticsData | null>(null);
  public analyticsData$ = this.analyticsDataSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get dashboard data
   */
  getDashboardData(): Observable<DashboardData> {
    return this.apiService.get<DashboardData>('reports/dashboard')
      .pipe(
        tap(data => {
          this.dashboardDataSubject.next(data);
        })
      );
  }

  /**
   * Get analytics data
   */
  getAnalyticsData(period: string = 'month'): Observable<AnalyticsData> {
    return this.apiService.get<AnalyticsData>('reports/analytics', { period })
      .pipe(
        tap(data => {
          this.analyticsDataSubject.next(data);
        })
      );
  }

  /**
   * Generate sales report
   */
  generateSalesReport(filters: ReportFilters): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/sales', filters);
  }

  /**
   * Generate inventory report
   */
  generateInventoryReport(filters: ReportFilters): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/inventory', filters);
  }

  /**
   * Generate financial report
   */
  generateFinancialReport(filters: ReportFilters): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/financial', filters);
  }

  /**
   * Generate customer report
   */
  generateCustomerReport(filters: ReportFilters): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/customers', filters);
  }

  /**
   * Generate supplier report
   */
  generateSupplierReport(filters: ReportFilters): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/suppliers', filters);
  }

  /**
   * Generate product report
   */
  generateProductReport(filters: ReportFilters): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/products', filters);
  }

  /**
   * Generate transaction report
   */
  generateTransactionReport(filters: ReportFilters): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/transactions', filters);
  }

  /**
   * Generate custom report
   */
  generateCustomReport(reportConfig: any): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/custom', reportConfig);
  }

  /**
   * Get all reports
   */
  getReports(): Observable<ReportData[]> {
    return this.apiService.get<ReportData[]>('reports')
      .pipe(
        tap(reports => {
          this.reportsSubject.next(reports);
        })
      );
  }

  /**
   * Get report by ID
   */
  getReport(id: string): Observable<ReportData> {
    return this.apiService.get<ReportData>(`reports/${id}`);
  }

  /**
   * Get report status
   */
  getReportStatus(id: string): Observable<ReportData> {
    return this.apiService.get<ReportData>(`reports/${id}/status`);
  }

  /**
   * Download report
   */
  downloadReport(id: string): Observable<Blob> {
    return this.apiService.downloadFile(`reports/${id}/download`, `report-${id}.pdf`);
  }

  /**
   * Delete report
   */
  deleteReport(id: string): Observable<void> {
    return this.apiService.delete<void>(`reports/${id}`)
      .pipe(
        tap(() => {
          const currentReports = this.reportsSubject.value;
          const filteredReports = currentReports.filter(r => r.id !== id);
          this.reportsSubject.next(filteredReports);
        })
      );
  }

  /**
   * Get sales summary
   */
  getSalesSummary(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>('reports/sales-summary', { period });
  }

  /**
   * Get inventory summary
   */
  getInventorySummary(): Observable<any> {
    return this.apiService.get<any>('reports/inventory-summary');
  }

  /**
   * Get financial summary
   */
  getFinancialSummary(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>('reports/financial-summary', { period });
  }

  /**
   * Get top selling products
   */
  getTopSellingProducts(limit: number = 10, period?: string): Observable<any[]> {
    return this.apiService.get<any[]>('reports/top-selling-products', { limit, period });
  }

  /**
   * Get top customers
   */
  getTopCustomers(limit: number = 10, period?: string): Observable<any[]> {
    return this.apiService.get<any[]>('reports/top-customers', { limit, period });
  }

  /**
   * Get top suppliers
   */
  getTopSuppliers(limit: number = 10, period?: string): Observable<any[]> {
    return this.apiService.get<any[]>('reports/top-suppliers', { limit, period });
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(): Observable<any[]> {
    return this.apiService.get<any[]>('reports/low-stock-products');
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Observable<any[]> {
    return this.apiService.get<any[]>('reports/out-of-stock-products');
  }

  /**
   * Get expiring products
   */
  getExpiringProducts(days: number = 30): Observable<any[]> {
    return this.apiService.get<any[]>('reports/expiring-products', { days });
  }

  /**
   * Get revenue by category
   */
  getRevenueByCategory(period: string = 'month'): Observable<any[]> {
    return this.apiService.get<any[]>('reports/revenue-by-category', { period });
  }

  /**
   * Get sales by month
   */
  getSalesByMonth(year?: number): Observable<any[]> {
    return this.apiService.get<any[]>('reports/sales-by-month', { year });
  }

  /**
   * Get profit margin analysis
   */
  getProfitMarginAnalysis(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>('reports/profit-margin-analysis', { period });
  }

  /**
   * Get customer acquisition report
   */
  getCustomerAcquisitionReport(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>('reports/customer-acquisition', { period });
  }

  /**
   * Get supplier performance report
   */
  getSupplierPerformanceReport(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>('reports/supplier-performance', { period });
  }

  /**
   * Get inventory turnover report
   */
  getInventoryTurnoverReport(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>('reports/inventory-turnover', { period });
  }

  /**
   * Get cash flow report
   */
  getCashFlowReport(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>('reports/cash-flow', { period });
  }

  /**
   * Get aging report
   */
  getAgingReport(type: 'receivables' | 'payables'): Observable<any> {
    return this.apiService.get<any>('reports/aging', { type });
  }

  /**
   * Export report data
   */
  exportReportData(reportType: string, filters: ReportFilters): Observable<Blob> {
    return this.apiService.downloadFile(`reports/export/${reportType}`, `${reportType}-report.xlsx`);
  }

  /**
   * Schedule report
   */
  scheduleReport(reportConfig: any, schedule: any): Observable<ReportData> {
    return this.apiService.post<ReportData>('reports/schedule', { reportConfig, schedule });
  }

  /**
   * Get scheduled reports
   */
  getScheduledReports(): Observable<ReportData[]> {
    return this.apiService.get<ReportData[]>('reports/scheduled');
  }

  /**
   * Cancel scheduled report
   */
  cancelScheduledReport(id: string): Observable<void> {
    return this.apiService.delete<void>(`reports/scheduled/${id}`);
  }

  /**
   * Get current reports
   */
  getCurrentReports(): ReportData[] {
    return this.reportsSubject.value;
  }

  /**
   * Get current dashboard data
   */
  getCurrentDashboardData(): DashboardData | null {
    return this.dashboardDataSubject.value;
  }

  /**
   * Get current analytics data
   */
  getCurrentAnalyticsData(): AnalyticsData | null {
    return this.analyticsDataSubject.value;
  }

  /**
   * Refresh reports list
   */
  refreshReports(): void {
    this.getReports().subscribe();
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboardData(): void {
    this.getDashboardData().subscribe();
  }

  /**
   * Refresh analytics data
   */
  refreshAnalyticsData(period: string = 'month'): void {
    this.getAnalyticsData(period).subscribe();
  }

  /**
   * Format currency for reports
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Format percentage for reports
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2
    }).format(value / 100);
  }

  /**
   * Format date for reports
   */
  formatDate(value: string | Date): string {
    const date = new Date(value);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  /**
   * Format number for reports
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }
}
