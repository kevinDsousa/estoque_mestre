import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  CompanyResponse, 
  CreateCompanyRequest, 
  UpdateCompanyRequest 
} from '@estoque-mestre/models';

export interface CompanyFilters {
  query?: string;
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CompanyStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  totalRevenue: number;
  averageRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companiesSubject = new BehaviorSubject<CompanyResponse[]>([]);
  public companies$ = this.companiesSubject.asObservable();

  private currentCompanySubject = new BehaviorSubject<CompanyResponse | null>(null);
  public currentCompany$ = this.currentCompanySubject.asObservable();

  private companyStatsSubject = new BehaviorSubject<CompanyStats | null>(null);
  public companyStats$ = this.companyStatsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all companies with pagination and filters
   */
  getCompanies(filters: CompanyFilters = {}): Observable<PaginatedResponse<CompanyResponse>> {
    return this.apiService.getPaginated<CompanyResponse>('companies', filters)
      .pipe(
        tap(response => {
          this.companiesSubject.next(response.data);
        })
      );
  }

  /**
   * Get company by ID
   */
  getCompany(id: string): Observable<CompanyResponse> {
    return this.apiService.get<CompanyResponse>(`companies/${id}`)
      .pipe(
        tap(company => {
          this.currentCompanySubject.next(company);
        })
      );
  }

  /**
   * Get current user's company
   */
  getMyCompany(): Observable<CompanyResponse> {
    return this.apiService.get<CompanyResponse>('companies/me')
      .pipe(
        tap(company => {
          this.currentCompanySubject.next(company);
        })
      );
  }

  /**
   * Create new company
   */
  createCompany(companyData: CreateCompanyRequest): Observable<CompanyResponse> {
    return this.apiService.post<CompanyResponse>('companies', companyData)
      .pipe(
        tap(company => {
          const currentCompanies = this.companiesSubject.value;
          this.companiesSubject.next([company, ...currentCompanies]);
        })
      );
  }

  /**
   * Update company
   */
  updateCompany(id: string, companyData: UpdateCompanyRequest): Observable<CompanyResponse> {
    return this.apiService.put<CompanyResponse>(`companies/${id}`, companyData)
      .pipe(
        tap(company => {
          this.currentCompanySubject.next(company);
          
          const currentCompanies = this.companiesSubject.value;
          const updatedCompanies = currentCompanies.map(c => 
            c.id === id ? { ...c, ...company } : c
          );
          this.companiesSubject.next(updatedCompanies);
        })
      );
  }

  /**
   * Update my company
   */
  updateMyCompany(companyData: UpdateCompanyRequest): Observable<CompanyResponse> {
    return this.apiService.put<CompanyResponse>('companies/me', companyData)
      .pipe(
        tap(company => {
          this.currentCompanySubject.next(company);
        })
      );
  }

  /**
   * Delete company
   */
  deleteCompany(id: string): Observable<void> {
    return this.apiService.delete<void>(`companies/${id}`)
      .pipe(
        tap(() => {
          const currentCompanies = this.companiesSubject.value;
          const filteredCompanies = currentCompanies.filter(c => c.id !== id);
          this.companiesSubject.next(filteredCompanies);
          
          if (this.currentCompanySubject.value?.id === id) {
            this.currentCompanySubject.next(null);
          }
        })
      );
  }

  /**
   * Search companies
   */
  searchCompanies(query: string, filters: Partial<CompanyFilters> = {}): Observable<PaginatedResponse<CompanyResponse>> {
    return this.getCompanies({ ...filters, query });
  }

  /**
   * Get companies by status
   */
  getCompaniesByStatus(status: string, filters: Partial<CompanyFilters> = {}): Observable<PaginatedResponse<CompanyResponse>> {
    return this.getCompanies({ ...filters, status });
  }

  /**
   * Get pending companies (for admin approval)
   */
  getPendingCompanies(filters: Partial<CompanyFilters> = {}): Observable<PaginatedResponse<CompanyResponse>> {
    return this.getCompanies({ ...filters, status: 'PENDING_APPROVAL' });
  }

  /**
   * Get active companies
   */
  getActiveCompanies(filters: Partial<CompanyFilters> = {}): Observable<PaginatedResponse<CompanyResponse>> {
    return this.getCompanies({ ...filters, status: 'ACTIVE' });
  }

  /**
   * Get suspended companies
   */
  getSuspendedCompanies(filters: Partial<CompanyFilters> = {}): Observable<PaginatedResponse<CompanyResponse>> {
    return this.getCompanies({ ...filters, status: 'SUSPENDED' });
  }

  /**
   * Approve company
   */
  approveCompany(id: string): Observable<CompanyResponse> {
    return this.apiService.patch<CompanyResponse>(`companies/${id}/approve`, {})
      .pipe(
        tap(company => {
          const currentCompanies = this.companiesSubject.value;
          const updatedCompanies = currentCompanies.map(c => 
            c.id === id ? { ...c, ...company } : c
          );
          this.companiesSubject.next(updatedCompanies);
        })
      );
  }

  /**
   * Reject company
   */
  rejectCompany(id: string, reason: string): Observable<CompanyResponse> {
    return this.apiService.patch<CompanyResponse>(`companies/${id}/reject`, { reason })
      .pipe(
        tap(company => {
          const currentCompanies = this.companiesSubject.value;
          const updatedCompanies = currentCompanies.map(c => 
            c.id === id ? { ...c, ...company } : c
          );
          this.companiesSubject.next(updatedCompanies);
        })
      );
  }

  /**
   * Suspend company
   */
  suspendCompany(id: string, reason: string): Observable<CompanyResponse> {
    return this.apiService.patch<CompanyResponse>(`companies/${id}/suspend`, { reason })
      .pipe(
        tap(company => {
          const currentCompanies = this.companiesSubject.value;
          const updatedCompanies = currentCompanies.map(c => 
            c.id === id ? { ...c, ...company } : c
          );
          this.companiesSubject.next(updatedCompanies);
        })
      );
  }

  /**
   * Reactivate company
   */
  reactivateCompany(id: string): Observable<CompanyResponse> {
    return this.apiService.patch<CompanyResponse>(`companies/${id}/reactivate`, {})
      .pipe(
        tap(company => {
          const currentCompanies = this.companiesSubject.value;
          const updatedCompanies = currentCompanies.map(c => 
            c.id === id ? { ...c, ...company } : c
          );
          this.companiesSubject.next(updatedCompanies);
        })
      );
  }

  /**
   * Get company statistics
   */
  getCompanyStats(): Observable<CompanyStats> {
    return this.apiService.get<CompanyStats>('companies/stats')
      .pipe(
        tap(stats => {
          this.companyStatsSubject.next(stats);
        })
      );
  }

  /**
   * Get company dashboard data
   */
  getCompanyDashboard(companyId: string): Observable<any> {
    return this.apiService.get<any>(`companies/${companyId}/dashboard`);
  }

  /**
   * Get my company dashboard
   */
  getMyCompanyDashboard(): Observable<any> {
    return this.apiService.get<any>('companies/me/dashboard');
  }

  /**
   * Get company settings
   */
  getCompanySettings(companyId: string): Observable<any> {
    return this.apiService.get<any>(`companies/${companyId}/settings`);
  }

  /**
   * Update company settings
   */
  updateCompanySettings(companyId: string, settings: any): Observable<any> {
    return this.apiService.put<any>(`companies/${companyId}/settings`, settings);
  }

  /**
   * Get my company settings
   */
  getMyCompanySettings(): Observable<any> {
    return this.apiService.get<any>('companies/me/settings');
  }

  /**
   * Update my company settings
   */
  updateMyCompanySettings(settings: any): Observable<any> {
    return this.apiService.put<any>('companies/me/settings', settings);
  }

  /**
   * Get company subscription
   */
  getCompanySubscription(companyId: string): Observable<any> {
    return this.apiService.get<any>(`companies/${companyId}/subscription`);
  }

  /**
   * Get my company subscription
   */
  getMyCompanySubscription(): Observable<any> {
    return this.apiService.get<any>('companies/me/subscription');
  }

  /**
   * Update company subscription
   */
  updateCompanySubscription(companyId: string, subscriptionData: any): Observable<any> {
    return this.apiService.put<any>(`companies/${companyId}/subscription`, subscriptionData);
  }

  /**
   * Get company users
   */
  getCompanyUsers(companyId: string): Observable<any[]> {
    return this.apiService.get<any[]>(`companies/${companyId}/users`);
  }

  /**
   * Get my company users
   */
  getMyCompanyUsers(): Observable<any[]> {
    return this.apiService.get<any[]>('companies/me/users');
  }

  /**
   * Export companies
   */
  exportCompanies(filters: CompanyFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('companies/export', 'companies.xlsx');
  }

  /**
   * Get current companies
   */
  getCurrentCompanies(): CompanyResponse[] {
    return this.companiesSubject.value;
  }

  /**
   * Get current company
   */
  getCurrentCompany(): CompanyResponse | null {
    return this.currentCompanySubject.value;
  }

  /**
   * Get current company stats
   */
  getCurrentCompanyStats(): CompanyStats | null {
    return this.companyStatsSubject.value;
  }

  /**
   * Clear current company
   */
  clearCurrentCompany(): void {
    this.currentCompanySubject.next(null);
  }

  /**
   * Refresh companies list
   */
  refreshCompanies(filters: CompanyFilters = {}): void {
    this.getCompanies(filters).subscribe();
  }

  /**
   * Refresh current company
   */
  refreshCurrentCompany(): void {
    const currentCompany = this.currentCompanySubject.value;
    if (currentCompany) {
      this.getCompany(currentCompany.id).subscribe();
    }
  }

  /**
   * Refresh company stats
   */
  refreshCompanyStats(): void {
    this.getCompanyStats().subscribe();
  }
}
