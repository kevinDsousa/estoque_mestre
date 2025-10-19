import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  CustomerResponse, 
  CreateCustomerRequest, 
  UpdateCustomerRequest 
} from '@estoque-mestre/models';

export interface CustomerFilters {
  query?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  byType: { [key: string]: number };
  totalValue: number;
  averageValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<CustomerResponse[]>([]);
  public customers$ = this.customersSubject.asObservable();

  private currentCustomerSubject = new BehaviorSubject<CustomerResponse | null>(null);
  public currentCustomer$ = this.currentCustomerSubject.asObservable();

  private customerStatsSubject = new BehaviorSubject<CustomerStats | null>(null);
  public customerStats$ = this.customerStatsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all customers with pagination and filters
   */
  getCustomers(filters: CustomerFilters = {}): Observable<PaginatedResponse<CustomerResponse>> {
    return this.apiService.getPaginated<CustomerResponse>('customers', filters)
      .pipe(
        tap(response => {
          this.customersSubject.next(response.data);
        })
      );
  }

  /**
   * Get customer by ID
   */
  getCustomer(id: string): Observable<CustomerResponse> {
    return this.apiService.get<CustomerResponse>(`customers/${id}`)
      .pipe(
        tap(customer => {
          this.currentCustomerSubject.next(customer);
        })
      );
  }

  /**
   * Create new customer
   */
  createCustomer(customerData: CreateCustomerRequest): Observable<CustomerResponse> {
    return this.apiService.post<CustomerResponse>('customers', customerData)
      .pipe(
        tap(customer => {
          const currentCustomers = this.customersSubject.value;
          this.customersSubject.next([customer, ...currentCustomers]);
        })
      );
  }

  /**
   * Update customer
   */
  updateCustomer(id: string, customerData: UpdateCustomerRequest): Observable<CustomerResponse> {
    return this.apiService.put<CustomerResponse>(`customers/${id}`, customerData)
      .pipe(
        tap(customer => {
          this.currentCustomerSubject.next(customer);
          
          const currentCustomers = this.customersSubject.value;
          const updatedCustomers = currentCustomers.map(c => 
            c.id === id ? { ...c, ...customer } : c
          );
          this.customersSubject.next(updatedCustomers);
        })
      );
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: string): Observable<void> {
    return this.apiService.delete<void>(`customers/${id}`)
      .pipe(
        tap(() => {
          const currentCustomers = this.customersSubject.value;
          const filteredCustomers = currentCustomers.filter(c => c.id !== id);
          this.customersSubject.next(filteredCustomers);
          
          if (this.currentCustomerSubject.value?.id === id) {
            this.currentCustomerSubject.next(null);
          }
        })
      );
  }

  /**
   * Search customers
   */
  searchCustomers(query: string, filters: Partial<CustomerFilters> = {}): Observable<PaginatedResponse<CustomerResponse>> {
    return this.getCustomers({ ...filters, query });
  }

  /**
   * Get active customers
   */
  getActiveCustomers(filters: Partial<CustomerFilters> = {}): Observable<PaginatedResponse<CustomerResponse>> {
    return this.getCustomers({ ...filters, status: 'ACTIVE' });
  }

  /**
   * Get inactive customers
   */
  getInactiveCustomers(filters: Partial<CustomerFilters> = {}): Observable<PaginatedResponse<CustomerResponse>> {
    return this.getCustomers({ ...filters, status: 'INACTIVE' });
  }

  /**
   * Get customer statistics
   */
  getCustomerStats(): Observable<CustomerStats> {
    return this.apiService.get<CustomerStats>('customers/stats')
      .pipe(
        tap(stats => {
          this.customerStatsSubject.next(stats);
        })
      );
  }

  /**
   * Get customer transactions
   */
  getCustomerTransactions(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`customers/${id}/transactions`);
  }

  /**
   * Get customer purchase history
   */
  getCustomerPurchaseHistory(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`customers/${id}/purchase-history`);
  }

  /**
   * Get current customers
   */
  getCurrentCustomers(): CustomerResponse[] {
    return this.customersSubject.value;
  }

  /**
   * Get current customer
   */
  getCurrentCustomer(): CustomerResponse | null {
    return this.currentCustomerSubject.value;
  }

  /**
   * Get current customer stats
   */
  getCurrentCustomerStats(): CustomerStats | null {
    return this.customerStatsSubject.value;
  }

  /**
   * Clear current customer
   */
  clearCurrentCustomer(): void {
    this.currentCustomerSubject.next(null);
  }

  /**
   * Refresh customers list
   */
  refreshCustomers(filters: CustomerFilters = {}): void {
    this.getCustomers(filters).subscribe();
  }

  /**
   * Refresh current customer
   */
  refreshCurrentCustomer(): void {
    const currentCustomer = this.currentCustomerSubject.value;
    if (currentCustomer) {
      this.getCustomer(currentCustomer.id).subscribe();
    }
  }

  /**
   * Refresh customer stats
   */
  refreshCustomerStats(): void {
    this.getCustomerStats().subscribe();
  }
}
