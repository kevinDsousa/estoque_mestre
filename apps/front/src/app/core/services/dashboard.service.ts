import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalTransactions: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  lowStockProducts: number;
  pendingOrders: number;
  activeUsers: number;
  monthlyRevenue: number;
}

export interface QuickStats {
  today: {
    sales: number;
    purchases: number;
    revenue: number;
    transactions: number;
  };
  thisWeek: {
    sales: number;
    purchases: number;
    revenue: number;
    transactions: number;
  };
  thisMonth: {
    sales: number;
    purchases: number;
    revenue: number;
    transactions: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'sale' | 'purchase' | 'stock_adjustment' | 'user_login' | 'product_created' | 'customer_created';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  metadata?: any;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category: string;
  supplier: string;
  lastUpdated: Date;
}

export interface PendingOrder {
  id: string;
  type: 'sale' | 'purchase';
  customerName?: string;
  supplierName?: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface SalesChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export interface InventoryChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('admin/dashboard/stats');
  }

  /**
   * Get quick statistics for different time periods
   */
  getQuickStats(): Observable<QuickStats> {
    return this.apiService.get<QuickStats>('admin/dashboard/quick-stats');
  }

  /**
   * Get recent activities
   */
  getRecentActivity(limit: number = 10): Observable<RecentActivity[]> {
    return this.apiService.get<RecentActivity[]>(`admin/dashboard/recent-activity?limit=${limit}`);
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(): Observable<LowStockProduct[]> {
    return this.apiService.get<LowStockProduct[]>('admin/dashboard/low-stock');
  }

  /**
   * Get pending orders
   */
  getPendingOrders(): Observable<PendingOrder[]> {
    return this.apiService.get<PendingOrder[]>('admin/dashboard/pending-orders');
  }

  /**
   * Get sales chart data
   */
  getSalesChartData(period: 'week' | 'month' | 'year' = 'month'): Observable<SalesChartData> {
    return this.apiService.get<SalesChartData>(`admin/dashboard/sales-chart?period=${period}`);
  }

  /**
   * Get inventory chart data
   */
  getInventoryChartData(): Observable<InventoryChartData> {
    return this.apiService.get<InventoryChartData>('admin/dashboard/inventory-chart');
  }

  /**
   * Get top selling products
   */
  getTopSellingProducts(limit: number = 5): Observable<any[]> {
    return this.apiService.get<any[]>(`admin/dashboard/top-selling?limit=${limit}`);
  }

  /**
   * Get top customers by revenue
   */
  getTopCustomers(limit: number = 5): Observable<any[]> {
    return this.apiService.get<any[]>(`admin/dashboard/top-customers?limit=${limit}`);
  }

  /**
   * Get revenue by category
   */
  getRevenueByCategory(): Observable<any[]> {
    return this.apiService.get<any[]>('admin/dashboard/revenue-by-category');
  }

  /**
   * Get monthly sales trend
   */
  getMonthlySalesTrend(months: number = 12): Observable<any[]> {
    return this.apiService.get<any[]>(`admin/dashboard/monthly-sales-trend?months=${months}`);
  }

  /**
   * Get inventory value by category
   */
  getInventoryValueByCategory(): Observable<any[]> {
    return this.apiService.get<any[]>('admin/dashboard/inventory-value-by-category');
  }

  /**
   * Get profit margin analysis
   */
  getProfitMarginAnalysis(): Observable<any> {
    return this.apiService.get<any>('admin/dashboard/profit-margin-analysis');
  }

  /**
   * Get stock movement trends
   */
  getStockMovementTrends(days: number = 30): Observable<any[]> {
    return this.apiService.get<any[]>(`admin/dashboard/stock-movement-trends?days=${days}`);
  }

  /**
   * Get supplier performance
   */
  getSupplierPerformance(): Observable<any[]> {
    return this.apiService.get<any[]>('admin/dashboard/supplier-performance');
  }

  /**
   * Get customer acquisition trends
   */
  getCustomerAcquisitionTrends(months: number = 12): Observable<any[]> {
    return this.apiService.get<any[]>(`admin/dashboard/customer-acquisition-trends?months=${months}`);
  }

  /**
   * Get system health metrics
   */
  getSystemHealthMetrics(): Observable<any> {
    return this.apiService.get<any>('admin/dashboard/system-health');
  }

  /**
   * Get alerts and notifications summary
   */
  getAlertsSummary(): Observable<any> {
    return this.apiService.get<any>('admin/dashboard/alerts-summary');
  }

  /**
   * Get export data for dashboard
   */
  exportDashboardData(format: 'csv' | 'xlsx' | 'pdf' = 'xlsx'): Observable<Blob> {
    return this.apiService.get<Blob>(`admin/dashboard/export?format=${format}`);
  }
}
