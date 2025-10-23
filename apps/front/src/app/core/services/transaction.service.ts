import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
// Interfaces locais
export interface TransactionResponse {
  id: string;
  type: 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  customerId?: string;
  supplierId?: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  supplier?: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentMethod?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentDate?: string;
}

export interface CreateTransactionRequest {
  type: 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
  customerId?: string;
  supplierId?: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod?: string;
}

export interface UpdateTransactionRequest {
  type?: 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
  customerId?: string;
  supplierId?: string;
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod?: string;
}

export interface TransactionFilters {
  query?: string;
  type?: string;
  status?: string;
  customerId?: string;
  supplierId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionStats {
  total: number;
  totalValue: number;
  averageValue: number;
  byType: { [key: string]: number };
  byStatus: { [key: string]: number };
  byMonth: { [key: string]: number };
}

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  tax?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<TransactionResponse[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  private currentTransactionSubject = new BehaviorSubject<TransactionResponse | null>(null);
  public currentTransaction$ = this.currentTransactionSubject.asObservable();

  private transactionStatsSubject = new BehaviorSubject<TransactionStats | null>(null);
  public transactionStats$ = this.transactionStatsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all transactions with pagination and filters
   */
  getTransactions(filters: TransactionFilters = {}): Observable<PaginatedResponse<TransactionResponse>> {
    return this.apiService.getPaginated<TransactionResponse>('transactions', filters)
      .pipe(
        tap(response => {
          this.transactionsSubject.next(response.data);
        })
      );
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): Observable<TransactionResponse> {
    return this.apiService.get<TransactionResponse>(`transactions/${id}`)
      .pipe(
        tap(transaction => {
          this.currentTransactionSubject.next(transaction);
        })
      );
  }

  /**
   * Create new transaction
   */
  createTransaction(transactionData: CreateTransactionRequest): Observable<TransactionResponse> {
    return this.apiService.post<TransactionResponse>('transactions', transactionData)
      .pipe(
        tap(transaction => {
          const currentTransactions = this.transactionsSubject.value;
          this.transactionsSubject.next([transaction, ...currentTransactions]);
        })
      );
  }

  /**
   * Update transaction
   */
  updateTransaction(id: string, transactionData: UpdateTransactionRequest): Observable<TransactionResponse> {
    return this.apiService.patch<TransactionResponse>(`transactions/${id}`, transactionData)
      .pipe(
        tap(transaction => {
          this.currentTransactionSubject.next(transaction);
          
          const currentTransactions = this.transactionsSubject.value;
          const updatedTransactions = currentTransactions.map(t => 
            t.id === id ? { ...t, ...transaction } : t
          );
          this.transactionsSubject.next(updatedTransactions);
        })
      );
  }

  /**
   * Delete transaction
   */
  deleteTransaction(id: string): Observable<void> {
    return this.apiService.delete<void>(`transactions/${id}`)
      .pipe(
        tap(() => {
          const currentTransactions = this.transactionsSubject.value;
          const filteredTransactions = currentTransactions.filter(t => t.id !== id);
          this.transactionsSubject.next(filteredTransactions);
          
          if (this.currentTransactionSubject.value?.id === id) {
            this.currentTransactionSubject.next(null);
          }
        })
      );
  }

  /**
   * Search transactions
   */
  searchTransactions(query: string, filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    return this.getTransactions({ ...filters, query });
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: string, filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    return this.getTransactions({ ...filters, type });
  }

  /**
   * Get transactions by status
   */
  getTransactionsByStatus(status: string, filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    return this.getTransactions({ ...filters, status });
  }

  /**
   * Get transactions by customer
   */
  getTransactionsByCustomer(customerId: string, filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    return this.getTransactions({ ...filters, customerId });
  }

  /**
   * Get transactions by supplier
   */
  getTransactionsBySupplier(supplierId: string, filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    return this.getTransactions({ ...filters, supplierId });
  }

  /**
   * Get transactions by date range
   */
  getTransactionsByDateRange(startDate: string, endDate: string, filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    return this.getTransactions({ ...filters, startDate, endDate });
  }

  /**
   * Get today's transactions
   */
  getTodayTransactions(filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getTransactions({ ...filters, startDate: today, endDate: today });
  }

  /**
   * Get this month's transactions
   */
  getThisMonthTransactions(filters: Partial<TransactionFilters> = {}): Observable<PaginatedResponse<TransactionResponse>> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return this.getTransactions({ ...filters, startDate: startOfMonth, endDate: endOfMonth });
  }

  /**
   * Approve transaction
   */
  approveTransaction(id: string): Observable<TransactionResponse> {
    return this.apiService.patch<TransactionResponse>(`transactions/${id}/approve`, {})
      .pipe(
        tap(transaction => {
          const currentTransactions = this.transactionsSubject.value;
          const updatedTransactions = currentTransactions.map(t => 
            t.id === id ? { ...t, ...transaction } : t
          );
          this.transactionsSubject.next(updatedTransactions);
        })
      );
  }

  /**
   * Cancel transaction
   */
  cancelTransaction(id: string, reason: string): Observable<TransactionResponse> {
    return this.apiService.patch<TransactionResponse>(`transactions/${id}/cancel`, { reason })
      .pipe(
        tap(transaction => {
          const currentTransactions = this.transactionsSubject.value;
          const updatedTransactions = currentTransactions.map(t => 
            t.id === id ? { ...t, ...transaction } : t
          );
          this.transactionsSubject.next(updatedTransactions);
        })
      );
  }

  /**
   * Complete transaction
   */
  completeTransaction(id: string): Observable<TransactionResponse> {
    return this.apiService.patch<TransactionResponse>(`transactions/${id}/complete`, {})
      .pipe(
        tap(transaction => {
          const currentTransactions = this.transactionsSubject.value;
          const updatedTransactions = currentTransactions.map(t => 
            t.id === id ? { ...t, ...transaction } : t
          );
          this.transactionsSubject.next(updatedTransactions);
        })
      );
  }

  /**
   * Get transaction items
   */
  getTransactionItems(id: string): Observable<TransactionItem[]> {
    return this.apiService.get<TransactionItem[]>(`transactions/${id}/items`);
  }

  /**
   * Add transaction item
   */
  addTransactionItem(id: string, item: Omit<TransactionItem, 'id'>): Observable<TransactionItem> {
    return this.apiService.post<TransactionItem>(`transactions/${id}/items`, item);
  }

  /**
   * Update transaction item
   */
  updateTransactionItem(id: string, itemId: string, item: Partial<TransactionItem>): Observable<TransactionItem> {
    return this.apiService.put<TransactionItem>(`transactions/${id}/items/${itemId}`, item);
  }

  /**
   * Remove transaction item
   */
  removeTransactionItem(id: string, itemId: string): Observable<void> {
    return this.apiService.delete<void>(`transactions/${id}/items/${itemId}`);
  }

  /**
   * Get transaction payments
   */
  getTransactionPayments(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`transactions/${id}/payments`);
  }

  /**
   * Add transaction payment
   */
  addTransactionPayment(id: string, payment: any): Observable<any> {
    return this.apiService.post<any>(`transactions/${id}/payments`, payment);
  }

  /**
   * Get transaction statistics
   */
  getTransactionStats(): Observable<TransactionStats> {
    return this.apiService.get<TransactionStats>('transactions/stats')
      .pipe(
        tap(stats => {
          this.transactionStatsSubject.next(stats);
        })
      );
  }

  /**
   * Get transaction statistics by date range
   */
  getTransactionStatsByDateRange(startDate: string, endDate: string): Observable<TransactionStats> {
    return this.apiService.get<TransactionStats>('transactions/stats', { startDate, endDate });
  }

  /**
   * Get sales summary
   */
  getSalesSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Observable<any> {
    return this.apiService.get<any>('transactions/sales-summary', { period });
  }

  /**
   * Get purchase summary
   */
  getPurchaseSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Observable<any> {
    return this.apiService.get<any>('transactions/purchase-summary', { period });
  }

  /**
   * Get top selling products
   */
  getTopSellingProducts(limit: number = 10, period?: string): Observable<any[]> {
    return this.apiService.get<any[]>('transactions/top-selling-products', { limit, period });
  }

  /**
   * Get top customers
   */
  getTopCustomers(limit: number = 10, period?: string): Observable<any[]> {
    return this.apiService.get<any[]>('transactions/top-customers', { limit, period });
  }

  /**
   * Get top suppliers
   */
  getTopSuppliers(limit: number = 10, period?: string): Observable<any[]> {
    return this.apiService.get<any[]>('transactions/top-suppliers', { limit, period });
  }

  /**
   * Generate transaction invoice
   */
  generateInvoice(id: string): Observable<Blob> {
    return this.apiService.downloadFile(`transactions/${id}/invoice`, `invoice-${id}.pdf`);
  }

  /**
   * Generate transaction receipt
   */
  generateReceipt(id: string): Observable<Blob> {
    return this.apiService.downloadFile(`transactions/${id}/receipt`, `receipt-${id}.pdf`);
  }

  /**
   * Export transactions
   */
  exportTransactions(filters: TransactionFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('transactions/export', 'transactions.xlsx');
  }

  /**
   * Get current transactions
   */
  getCurrentTransactions(): TransactionResponse[] {
    return this.transactionsSubject.value;
  }

  /**
   * Get current transaction
   */
  getCurrentTransaction(): TransactionResponse | null {
    return this.currentTransactionSubject.value;
  }

  /**
   * Get current transaction stats
   */
  getCurrentTransactionStats(): TransactionStats | null {
    return this.transactionStatsSubject.value;
  }

  /**
   * Clear current transaction
   */
  clearCurrentTransaction(): void {
    this.currentTransactionSubject.next(null);
  }

  /**
   * Refresh transactions list
   */
  refreshTransactions(filters: TransactionFilters = {}): void {
    this.getTransactions(filters).subscribe();
  }

  /**
   * Refresh current transaction
   */
  refreshCurrentTransaction(): void {
    const currentTransaction = this.currentTransactionSubject.value;
    if (currentTransaction) {
      this.getTransaction(currentTransaction.id).subscribe();
    }
  }

  /**
   * Refresh transaction stats
   */
  refreshTransactionStats(): void {
    this.getTransactionStats().subscribe();
  }
}
