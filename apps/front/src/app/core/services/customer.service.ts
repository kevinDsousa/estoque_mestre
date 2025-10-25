import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
// Interfaces locais
export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  customerType: 'INDIVIDUAL' | 'COMPANY';
  taxId?: string;
  notes?: string;
  lastPurchaseAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  customerType?: 'INDIVIDUAL' | 'COMPANY';
  taxId?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  customerType?: 'INDIVIDUAL' | 'COMPANY';
  taxId?: string;
  notes?: string;
}

export interface CustomerFilters {
  search?: string;
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
    return this.apiService.patch<CustomerResponse>(`customers/${id}`, customerData)
      .pipe(
        tap(customer => {
          // Alguns PATCH podem retornar 204/sem corpo; nesse caso não atualizamos os subjects
          if (!customer) {
            return;
          }
          this.currentCustomerSubject.next(customer);

          const currentCustomers = this.customersSubject.value || [];
          const updatedCustomers = (Array.isArray(currentCustomers) ? currentCustomers : []).map(c => 
            c.id === id ? { ...c, ...customer } : c
          );
          this.customersSubject.next(updatedCustomers);
        })
      );
  }

  /**
   * Delete customer (or deactivate if has transaction history)
   */
  deleteCustomer(id: string): Observable<CustomerResponse | void> {
    return this.apiService.delete<CustomerResponse | void>(`customers/${id}`)
      .pipe(
        tap((response) => {
          // Se retornou o cliente, foi desativado ao invés de excluído
          if (response && typeof response === 'object' && 'status' in response) {
            const currentCustomers = this.customersSubject.value || [];
            const updatedCustomers = (Array.isArray(currentCustomers) ? currentCustomers : []).map(c => 
              c.id === id ? { ...c, ...response } : c
            );
            this.customersSubject.next(updatedCustomers);
          } else {
            // Foi realmente excluído
            const currentCustomers = this.customersSubject.value || [];
            const filteredCustomers = (Array.isArray(currentCustomers) ? currentCustomers : []).filter(c => c.id !== id);
            this.customersSubject.next(filteredCustomers);
            
            if (this.currentCustomerSubject.value?.id === id) {
              this.currentCustomerSubject.next(null);
            }
          }
        })
      );
  }

  /**
   * Toggle customer status (ACTIVE <-> INACTIVE)
   */
  toggleCustomerStatus(id: string, currentStatus: string): Observable<CustomerResponse> {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.apiService.patch<CustomerResponse>(`customers/${id}/status`, { status: newStatus })
      .pipe(
        tap((customer) => {
          this.currentCustomerSubject.next(customer);
          
          // Só atualiza o array se ele existir
          const currentCustomers = this.customersSubject.value || [];
          if (Array.isArray(currentCustomers)) {
            const updatedCustomers = (Array.isArray(currentCustomers) ? currentCustomers : []).map(c => 
              c.id === id ? { ...c, ...customer } : c
            );
            this.customersSubject.next(updatedCustomers);
          }
        })
      );
  }

  /**
   * Search customers
   */
  searchCustomers(query: string, filters: Partial<CustomerFilters> = {}): Observable<PaginatedResponse<CustomerResponse>> {
    return this.getCustomers({ ...filters, search: query });
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
