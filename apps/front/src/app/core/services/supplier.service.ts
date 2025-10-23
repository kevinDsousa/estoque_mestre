import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
// Interfaces locais
export interface SupplierResponse {
  id: string;
  name: string;
  document?: string;
  type: 'DISTRIBUTOR' | 'MANUFACTURER' | 'WHOLESALER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  contacts?: Array<{
    name: string;
    email: string;
    phone: string;
    role: string;
  }>;
  addresses?: Array<{
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  document?: string;
  type: 'DISTRIBUTOR' | 'MANUFACTURER' | 'WHOLESALER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  contacts?: Array<{
    name: string;
    email: string;
    phone: string;
    role: string;
  }>;
  addresses?: Array<{
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  document?: string;
  type?: 'DISTRIBUTOR' | 'MANUFACTURER' | 'WHOLESALER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  contacts?: Array<{
    name: string;
    email: string;
    phone: string;
    role: string;
  }>;
  addresses?: Array<{
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
}

export interface SupplierFilters {
  query?: string;
  status?: string;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  averageRating: number;
  totalProducts: number;
  totalValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private suppliersSubject = new BehaviorSubject<SupplierResponse[]>([]);
  public suppliers$ = this.suppliersSubject.asObservable();

  private currentSupplierSubject = new BehaviorSubject<SupplierResponse | null>(null);
  public currentSupplier$ = this.currentSupplierSubject.asObservable();

  private supplierStatsSubject = new BehaviorSubject<SupplierStats | null>(null);
  public supplierStats$ = this.supplierStatsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all suppliers with pagination and filters
   */
  getSuppliers(filters: SupplierFilters = {}): Observable<PaginatedResponse<SupplierResponse>> {
    return this.apiService.getPaginated<SupplierResponse>('suppliers', filters)
      .pipe(
        tap(response => {
          this.suppliersSubject.next(response.data);
        })
      );
  }

  /**
   * Get supplier by ID
   */
  getSupplier(id: string): Observable<SupplierResponse> {
    return this.apiService.get<SupplierResponse>(`suppliers/${id}`)
      .pipe(
        tap(supplier => {
          this.currentSupplierSubject.next(supplier);
        })
      );
  }

  /**
   * Create new supplier
   */
  createSupplier(supplierData: CreateSupplierRequest): Observable<SupplierResponse> {
    return this.apiService.post<SupplierResponse>('suppliers', supplierData);
  }

  /**
   * Update supplier
   */
  updateSupplier(id: string, supplierData: UpdateSupplierRequest): Observable<SupplierResponse> {
    return this.apiService.patch<SupplierResponse>(`suppliers/${id}`, supplierData);
  }

  /**
   * Delete supplier
   */
  deleteSupplier(id: string): Observable<void> {
    return this.apiService.delete<void>(`suppliers/${id}`)
      .pipe(
        tap(() => {
          const currentSuppliers = this.suppliersSubject.value;
          const filteredSuppliers = currentSuppliers.filter(s => s.id !== id);
          this.suppliersSubject.next(filteredSuppliers);
          
          if (this.currentSupplierSubject.value?.id === id) {
            this.currentSupplierSubject.next(null);
          }
        })
      );
  }

  /**
   * Search suppliers
   */
  searchSuppliers(query: string, filters: Partial<SupplierFilters> = {}): Observable<PaginatedResponse<SupplierResponse>> {
    return this.getSuppliers({ ...filters, query });
  }

  /**
   * Get active suppliers
   */
  getActiveSuppliers(filters: Partial<SupplierFilters> = {}): Observable<PaginatedResponse<SupplierResponse>> {
    return this.getSuppliers({ ...filters, status: 'ACTIVE' });
  }

  /**
   * Get inactive suppliers
   */
  getInactiveSuppliers(filters: Partial<SupplierFilters> = {}): Observable<PaginatedResponse<SupplierResponse>> {
    return this.getSuppliers({ ...filters, status: 'INACTIVE' });
  }

  /**
   * Get suppliers by rating
   */
  getSuppliersByRating(minRating: number, filters: Partial<SupplierFilters> = {}): Observable<PaginatedResponse<SupplierResponse>> {
    return this.getSuppliers({ ...filters, rating: minRating });
  }

  /**
   * Activate supplier
   */
  activateSupplier(id: string): Observable<SupplierResponse> {
    return this.apiService.patch<SupplierResponse>(`suppliers/${id}/activate`, {})
      .pipe(
        tap(supplier => {
          const currentSuppliers = this.suppliersSubject.value;
          const updatedSuppliers = currentSuppliers.map(s => 
            s.id === id ? { ...s, ...supplier } : s
          );
          this.suppliersSubject.next(updatedSuppliers);
        })
      );
  }

  /**
   * Deactivate supplier
   */
  deactivateSupplier(id: string): Observable<SupplierResponse> {
    return this.apiService.patch<SupplierResponse>(`suppliers/${id}/deactivate`, {})
      .pipe(
        tap(supplier => {
          const currentSuppliers = this.suppliersSubject.value;
          const updatedSuppliers = currentSuppliers.map(s => 
            s.id === id ? { ...s, ...supplier } : s
          );
          this.suppliersSubject.next(updatedSuppliers);
        })
      );
  }

  /**
   * Rate supplier
   */
  rateSupplier(id: string, rating: number, comment?: string): Observable<SupplierResponse> {
    return this.apiService.post<SupplierResponse>(`suppliers/${id}/rate`, { rating, comment })
      .pipe(
        tap(supplier => {
          const currentSuppliers = this.suppliersSubject.value;
          const updatedSuppliers = currentSuppliers.map(s => 
            s.id === id ? { ...s, ...supplier } : s
          );
          this.suppliersSubject.next(updatedSuppliers);
        })
      );
  }

  /**
   * Get supplier products
   */
  getSupplierProducts(id: string): Observable<any[]> {
    return this.apiService.get<any>(`suppliers/${id}/products`)
      .pipe(
        map((response: any) => response.products || [])
      );
  }

  /**
   * Get supplier transactions
   */
  getSupplierTransactions(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`suppliers/${id}/transactions`);
  }

  /**
   * Get supplier statistics
   */
  getSupplierStats(): Observable<SupplierStats> {
    return this.apiService.get<SupplierStats>('suppliers/stats')
      .pipe(
        tap(stats => {
          this.supplierStatsSubject.next(stats);
        })
      );
  }

  /**
   * Get supplier performance metrics
   */
  getSupplierPerformance(id: string): Observable<any> {
    return this.apiService.get<any>(`suppliers/${id}/performance`);
  }

  /**
   * Get supplier contact information
   */
  getSupplierContacts(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`suppliers/${id}/contacts`);
  }

  /**
   * Add supplier contact
   */
  addSupplierContact(id: string, contactData: any): Observable<any> {
    return this.apiService.post<any>(`suppliers/${id}/contacts`, contactData);
  }

  /**
   * Update supplier contact
   */
  updateSupplierContact(id: string, contactId: string, contactData: any): Observable<any> {
    return this.apiService.put<any>(`suppliers/${id}/contacts/${contactId}`, contactData);
  }

  /**
   * Delete supplier contact
   */
  deleteSupplierContact(id: string, contactId: string): Observable<void> {
    return this.apiService.delete<void>(`suppliers/${id}/contacts/${contactId}`);
  }

  /**
   * Get supplier documents
   */
  getSupplierDocuments(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`suppliers/${id}/documents`);
  }

  /**
   * Upload supplier document
   */
  uploadSupplierDocument(id: string, file: File, documentType: string): Observable<any> {
    return this.apiService.uploadFile<any>(`suppliers/${id}/documents`, file, { documentType });
  }

  /**
   * Delete supplier document
   */
  deleteSupplierDocument(id: string, documentId: string): Observable<void> {
    return this.apiService.delete<void>(`suppliers/${id}/documents/${documentId}`);
  }

  /**
   * Get supplier payment terms
   */
  getSupplierPaymentTerms(id: string): Observable<any> {
    return this.apiService.get<any>(`suppliers/${id}/payment-terms`);
  }

  /**
   * Update supplier payment terms
   */
  updateSupplierPaymentTerms(id: string, paymentTerms: any): Observable<any> {
    return this.apiService.put<any>(`suppliers/${id}/payment-terms`, paymentTerms);
  }

  /**
   * Get supplier delivery performance
   */
  getSupplierDeliveryPerformance(id: string): Observable<any> {
    return this.apiService.get<any>(`suppliers/${id}/delivery-performance`);
  }

  /**
   * Bulk update suppliers
   */
  bulkUpdateSuppliers(updates: Array<{ id: string; data: UpdateSupplierRequest }>): Observable<SupplierResponse[]> {
    return this.apiService.post<SupplierResponse[]>('suppliers/bulk-update', { updates });
  }

  /**
   * Bulk delete suppliers
   */
  bulkDeleteSuppliers(supplierIds: string[]): Observable<void> {
    return this.apiService.post<void>('suppliers/bulk-delete', { supplierIds });
  }

  /**
   * Export suppliers
   */
  exportSuppliers(filters: SupplierFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('suppliers/export', 'suppliers.xlsx');
  }

  /**
   * Import suppliers
   */
  importSuppliers(file: File): Observable<{ success: number; errors: any[] }> {
    return this.apiService.uploadFile<{ success: number; errors: any[] }>('suppliers/import', file);
  }

  /**
   * Get current suppliers
   */
  getCurrentSuppliers(): SupplierResponse[] {
    return this.suppliersSubject.value;
  }

  /**
   * Get current supplier
   */
  getCurrentSupplier(): SupplierResponse | null {
    return this.currentSupplierSubject.value;
  }

  /**
   * Get current supplier stats
   */
  getCurrentSupplierStats(): SupplierStats | null {
    return this.supplierStatsSubject.value;
  }

  /**
   * Clear current supplier
   */
  clearCurrentSupplier(): void {
    this.currentSupplierSubject.next(null);
  }

  /**
   * Refresh suppliers list
   */
  refreshSuppliers(filters: SupplierFilters = {}): void {
    this.getSuppliers(filters).subscribe();
  }

  /**
   * Refresh current supplier
   */
  refreshCurrentSupplier(): void {
    const currentSupplier = this.currentSupplierSubject.value;
    if (currentSupplier) {
      this.getSupplier(currentSupplier.id).subscribe();
    }
  }

  /**
   * Refresh supplier stats
   */
  refreshSupplierStats(): void {
    this.getSupplierStats().subscribe();
  }
}
