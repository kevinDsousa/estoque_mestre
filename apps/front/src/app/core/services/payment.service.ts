import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  PaymentOrderResponse, 
  CreatePaymentOrderRequest, 
  UpdatePaymentOrderRequest 
} from '@estoque-mestre/models';

export interface PaymentFilters {
  query?: string;
  status?: string;
  method?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentStats {
  total: number;
  totalAmount: number;
  averageAmount: number;
  byStatus: { [key: string]: number };
  byMethod: { [key: string]: number };
  byMonth: { [key: string]: number };
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'cash' | 'transfer';
  name: string;
  isActive: boolean;
  config: any;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  paymentMethodId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentsSubject = new BehaviorSubject<PaymentOrderResponse[]>([]);
  public payments$ = this.paymentsSubject.asObservable();

  private currentPaymentSubject = new BehaviorSubject<PaymentOrderResponse | null>(null);
  public currentPayment$ = this.currentPaymentSubject.asObservable();

  private paymentStatsSubject = new BehaviorSubject<PaymentStats | null>(null);
  public paymentStats$ = this.paymentStatsSubject.asObservable();

  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  public paymentMethods$ = this.paymentMethodsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all payments with pagination and filters
   */
  getPayments(filters: PaymentFilters = {}): Observable<PaginatedResponse<PaymentOrderResponse>> {
    return this.apiService.getPaginated<PaymentOrderResponse>('payments', filters)
      .pipe(
        tap(response => {
          this.paymentsSubject.next(response.data);
        })
      );
  }

  /**
   * Get payment by ID
   */
  getPayment(id: string): Observable<PaymentOrderResponse> {
    return this.apiService.get<PaymentOrderResponse>(`payments/${id}`)
      .pipe(
        tap(payment => {
          this.currentPaymentSubject.next(payment);
        })
      );
  }

  /**
   * Create new payment
   */
  createPayment(paymentData: CreatePaymentOrderRequest): Observable<PaymentOrderResponse> {
    return this.apiService.post<PaymentOrderResponse>('payments', paymentData)
      .pipe(
        tap(payment => {
          const currentPayments = this.paymentsSubject.value;
          this.paymentsSubject.next([payment, ...currentPayments]);
        })
      );
  }

  /**
   * Update payment
   */
  updatePayment(id: string, paymentData: UpdatePaymentOrderRequest): Observable<PaymentOrderResponse> {
    return this.apiService.put<PaymentOrderResponse>(`payments/${id}`, paymentData)
      .pipe(
        tap(payment => {
          this.currentPaymentSubject.next(payment);
          
          const currentPayments = this.paymentsSubject.value;
          const updatedPayments = currentPayments.map(p => 
            p.id === id ? { ...p, ...payment } : p
          );
          this.paymentsSubject.next(updatedPayments);
        })
      );
  }

  /**
   * Delete payment
   */
  deletePayment(id: string): Observable<void> {
    return this.apiService.delete<void>(`payments/${id}`)
      .pipe(
        tap(() => {
          const currentPayments = this.paymentsSubject.value;
          const filteredPayments = currentPayments.filter(p => p.id !== id);
          this.paymentsSubject.next(filteredPayments);
          
          if (this.currentPaymentSubject.value?.id === id) {
            this.currentPaymentSubject.next(null);
          }
        })
      );
  }

  /**
   * Process payment
   */
  processPayment(id: string, paymentMethodData: any): Observable<PaymentIntent> {
    return this.apiService.post<PaymentIntent>(`payments/${id}/process`, paymentMethodData);
  }

  /**
   * Confirm payment
   */
  confirmPayment(id: string, paymentIntentId: string): Observable<PaymentOrderResponse> {
    return this.apiService.post<PaymentOrderResponse>(`payments/${id}/confirm`, { paymentIntentId })
      .pipe(
        tap(payment => {
          const currentPayments = this.paymentsSubject.value;
          const updatedPayments = currentPayments.map(p => 
            p.id === id ? { ...p, ...payment } : p
          );
          this.paymentsSubject.next(updatedPayments);
        })
      );
  }

  /**
   * Cancel payment
   */
  cancelPayment(id: string, reason?: string): Observable<PaymentOrderResponse> {
    return this.apiService.post<PaymentOrderResponse>(`payments/${id}/cancel`, { reason })
      .pipe(
        tap(payment => {
          const currentPayments = this.paymentsSubject.value;
          const updatedPayments = currentPayments.map(p => 
            p.id === id ? { ...p, ...payment } : p
          );
          this.paymentsSubject.next(updatedPayments);
        })
      );
  }

  /**
   * Refund payment
   */
  refundPayment(id: string, amount?: number, reason?: string): Observable<PaymentOrderResponse> {
    return this.apiService.post<PaymentOrderResponse>(`payments/${id}/refund`, { amount, reason })
      .pipe(
        tap(payment => {
          const currentPayments = this.paymentsSubject.value;
          const updatedPayments = currentPayments.map(p => 
            p.id === id ? { ...p, ...payment } : p
          );
          this.paymentsSubject.next(updatedPayments);
        })
      );
  }

  /**
   * Get payment methods
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.apiService.get<PaymentMethod[]>('payments/methods')
      .pipe(
        tap(methods => {
          this.paymentMethodsSubject.next(methods);
        })
      );
  }

  /**
   * Create payment method
   */
  createPaymentMethod(methodData: Omit<PaymentMethod, 'id'>): Observable<PaymentMethod> {
    return this.apiService.post<PaymentMethod>('payments/methods', methodData)
      .pipe(
        tap(method => {
          const currentMethods = this.paymentMethodsSubject.value;
          this.paymentMethodsSubject.next([method, ...currentMethods]);
        })
      );
  }

  /**
   * Update payment method
   */
  updatePaymentMethod(id: string, methodData: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.apiService.put<PaymentMethod>(`payments/methods/${id}`, methodData)
      .pipe(
        tap(method => {
          const currentMethods = this.paymentMethodsSubject.value;
          const updatedMethods = currentMethods.map(m => 
            m.id === id ? { ...m, ...method } : m
          );
          this.paymentMethodsSubject.next(updatedMethods);
        })
      );
  }

  /**
   * Delete payment method
   */
  deletePaymentMethod(id: string): Observable<void> {
    return this.apiService.delete<void>(`payments/methods/${id}`)
      .pipe(
        tap(() => {
          const currentMethods = this.paymentMethodsSubject.value;
          const filteredMethods = currentMethods.filter(m => m.id !== id);
          this.paymentMethodsSubject.next(filteredMethods);
        })
      );
  }

  /**
   * Get payment statistics
   */
  getPaymentStats(): Observable<PaymentStats> {
    return this.apiService.get<PaymentStats>('payments/stats')
      .pipe(
        tap(stats => {
          this.paymentStatsSubject.next(stats);
        })
      );
  }

  /**
   * Get payment statistics by date range
   */
  getPaymentStatsByDateRange(startDate: string, endDate: string): Observable<PaymentStats> {
    return this.apiService.get<PaymentStats>('payments/stats', { startDate, endDate });
  }

  /**
   * Get payment summary
   */
  getPaymentSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Observable<any> {
    return this.apiService.get<any>('payments/summary', { period });
  }

  /**
   * Get payment methods summary
   */
  getPaymentMethodsSummary(period?: string): Observable<any> {
    return this.apiService.get<any>('payments/methods-summary', { period });
  }

  /**
   * Get failed payments
   */
  getFailedPayments(filters: Partial<PaymentFilters> = {}): Observable<PaginatedResponse<PaymentOrderResponse>> {
    return this.getPayments({ ...filters, status: 'FAILED' });
  }

  /**
   * Get pending payments
   */
  getPendingPayments(filters: Partial<PaymentFilters> = {}): Observable<PaginatedResponse<PaymentOrderResponse>> {
    return this.getPayments({ ...filters, status: 'PENDING' });
  }

  /**
   * Get successful payments
   */
  getSuccessfulPayments(filters: Partial<PaymentFilters> = {}): Observable<PaginatedResponse<PaymentOrderResponse>> {
    return this.getPayments({ ...filters, status: 'SUCCESS' });
  }

  /**
   * Retry failed payment
   */
  retryPayment(id: string): Observable<PaymentIntent> {
    return this.apiService.post<PaymentIntent>(`payments/${id}/retry`, {});
  }

  /**
   * Generate payment receipt
   */
  generateReceipt(id: string): Observable<Blob> {
    return this.apiService.downloadFile(`payments/${id}/receipt`, `receipt-${id}.pdf`);
  }

  /**
   * Generate payment invoice
   */
  generateInvoice(id: string): Observable<Blob> {
    return this.apiService.downloadFile(`payments/${id}/invoice`, `invoice-${id}.pdf`);
  }

  /**
   * Export payments
   */
  exportPayments(filters: PaymentFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('payments/export', 'payments.xlsx');
  }

  /**
   * Get Stripe payment intent
   */
  createStripePaymentIntent(amount: number, currency: string = 'BRL'): Observable<PaymentIntent> {
    return this.apiService.post<PaymentIntent>('payments/stripe/create-intent', { amount, currency });
  }

  /**
   * Confirm Stripe payment
   */
  confirmStripePayment(paymentIntentId: string): Observable<PaymentOrderResponse> {
    return this.apiService.post<PaymentOrderResponse>('payments/stripe/confirm', { paymentIntentId });
  }

  /**
   * Get current payments
   */
  getCurrentPayments(): PaymentOrderResponse[] {
    return this.paymentsSubject.value;
  }

  /**
   * Get current payment
   */
  getCurrentPayment(): PaymentOrderResponse | null {
    return this.currentPaymentSubject.value;
  }

  /**
   * Get current payment stats
   */
  getCurrentPaymentStats(): PaymentStats | null {
    return this.paymentStatsSubject.value;
  }

  /**
   * Get current payment methods
   */
  getCurrentPaymentMethods(): PaymentMethod[] {
    return this.paymentMethodsSubject.value;
  }

  /**
   * Clear current payment
   */
  clearCurrentPayment(): void {
    this.currentPaymentSubject.next(null);
  }

  /**
   * Refresh payments list
   */
  refreshPayments(filters: PaymentFilters = {}): void {
    this.getPayments(filters).subscribe();
  }

  /**
   * Refresh current payment
   */
  refreshCurrentPayment(): void {
    const currentPayment = this.currentPaymentSubject.value;
    if (currentPayment) {
      this.getPayment(currentPayment.id).subscribe();
    }
  }

  /**
   * Refresh payment stats
   */
  refreshPaymentStats(): void {
    this.getPaymentStats().subscribe();
  }

  /**
   * Refresh payment methods
   */
  refreshPaymentMethods(): void {
    this.getPaymentMethods().subscribe();
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Assuming amount is in cents
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Valor deve ser maior que zero' };
    }
    
    if (amount < 50) { // Minimum 50 cents
      return { valid: false, error: 'Valor mínimo é R$ 0,50' };
    }
    
    return { valid: true };
  }
}
