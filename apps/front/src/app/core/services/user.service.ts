import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserRequest,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '@estoque-mestre/models';

export interface UserFilters {
  query?: string;
  role?: string;
  status?: string;
  companyId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: { [key: string]: number };
  byCompany: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<UserResponse[]>([]);
  public users$ = this.usersSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private userStatsSubject = new BehaviorSubject<UserStats | null>(null);
  public userStats$ = this.userStatsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all users with pagination and filters
   */
  getUsers(filters: UserFilters = {}): Observable<PaginatedResponse<UserResponse>> {
    return this.apiService.getPaginated<UserResponse>('users', filters)
      .pipe(
        tap(response => {
          this.usersSubject.next(response.data);
        })
      );
  }

  /**
   * Get user by ID
   */
  getUser(id: string): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`users/${id}`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Get current user profile
   */
  getMyProfile(): Observable<UserResponse> {
    return this.apiService.get<UserResponse>('users/me')
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Create new user
   */
  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    return this.apiService.post<UserResponse>('users', userData)
      .pipe(
        tap(user => {
          const currentUsers = this.usersSubject.value;
          this.usersSubject.next([user, ...currentUsers]);
        })
      );
  }

  /**
   * Update user
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<UserResponse> {
    return this.apiService.put<UserResponse>(`users/${id}`, userData)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(u => 
            u.id === id ? { ...u, ...user } : u
          );
          this.usersSubject.next(updatedUsers);
        })
      );
  }

  /**
   * Update my profile
   */
  updateMyProfile(profileData: UpdateProfileRequest): Observable<UserResponse> {
    return this.apiService.put<UserResponse>('users/me', profileData)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`users/${id}`)
      .pipe(
        tap(() => {
          const currentUsers = this.usersSubject.value;
          const filteredUsers = currentUsers.filter(u => u.id !== id);
          this.usersSubject.next(filteredUsers);
          
          if (this.currentUserSubject.value?.id === id) {
            this.currentUserSubject.next(null);
          }
        })
      );
  }

  /**
   * Search users
   */
  searchUsers(query: string, filters: Partial<UserFilters> = {}): Observable<PaginatedResponse<UserResponse>> {
    return this.getUsers({ ...filters, query });
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string, filters: Partial<UserFilters> = {}): Observable<PaginatedResponse<UserResponse>> {
    return this.getUsers({ ...filters, role });
  }

  /**
   * Get users by company
   */
  getUsersByCompany(companyId: string, filters: Partial<UserFilters> = {}): Observable<PaginatedResponse<UserResponse>> {
    return this.getUsers({ ...filters, companyId });
  }

  /**
   * Get active users
   */
  getActiveUsers(filters: Partial<UserFilters> = {}): Observable<PaginatedResponse<UserResponse>> {
    return this.getUsers({ ...filters, status: 'ACTIVE' });
  }

  /**
   * Get inactive users
   */
  getInactiveUsers(filters: Partial<UserFilters> = {}): Observable<PaginatedResponse<UserResponse>> {
    return this.getUsers({ ...filters, status: 'INACTIVE' });
  }

  /**
   * Activate user
   */
  activateUser(id: string): Observable<UserResponse> {
    return this.apiService.patch<UserResponse>(`users/${id}/activate`, {})
      .pipe(
        tap(user => {
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(u => 
            u.id === id ? { ...u, ...user } : u
          );
          this.usersSubject.next(updatedUsers);
        })
      );
  }

  /**
   * Deactivate user
   */
  deactivateUser(id: string): Observable<UserResponse> {
    return this.apiService.patch<UserResponse>(`users/${id}/deactivate`, {})
      .pipe(
        tap(user => {
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(u => 
            u.id === id ? { ...u, ...user } : u
          );
          this.usersSubject.next(updatedUsers);
        })
      );
  }

  /**
   * Change user password
   */
  changeUserPassword(id: string, passwordData: ChangePasswordRequest): Observable<void> {
    return this.apiService.post<void>(`users/${id}/change-password`, passwordData);
  }

  /**
   * Reset user password
   */
  resetUserPassword(id: string): Observable<{ temporaryPassword: string }> {
    return this.apiService.post<{ temporaryPassword: string }>(`users/${id}/reset-password`, {});
  }

  /**
   * Update user permissions
   */
  updateUserPermissions(id: string, permissions: any): Observable<UserResponse> {
    return this.apiService.put<UserResponse>(`users/${id}/permissions`, { permissions })
      .pipe(
        tap(user => {
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(u => 
            u.id === id ? { ...u, ...user } : u
          );
          this.usersSubject.next(updatedUsers);
        })
      );
  }

  /**
   * Get user permissions
   */
  getUserPermissions(id: string): Observable<any> {
    return this.apiService.get<any>(`users/${id}/permissions`);
  }

  /**
   * Get my permissions
   */
  getMyPermissions(): Observable<any> {
    return this.apiService.get<any>('users/me/permissions');
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStats> {
    return this.apiService.get<UserStats>('users/stats')
      .pipe(
        tap(stats => {
          this.userStatsSubject.next(stats);
        })
      );
  }

  /**
   * Get user activity log
   */
  getUserActivityLog(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`users/${id}/activity`);
  }

  /**
   * Get my activity log
   */
  getMyActivityLog(): Observable<any[]> {
    return this.apiService.get<any[]>(`users/me/activity`);
  }

  /**
   * Get user sessions
   */
  getUserSessions(id: string): Observable<any[]> {
    return this.apiService.get<any[]>(`users/${id}/sessions`);
  }

  /**
   * Get my sessions
   */
  getMySessions(): Observable<any[]> {
    return this.apiService.get<any[]>(`users/me/sessions`);
  }

  /**
   * Terminate user session
   */
  terminateUserSession(id: string, sessionId: string): Observable<void> {
    return this.apiService.delete<void>(`users/${id}/sessions/${sessionId}`);
  }

  /**
   * Terminate my session
   */
  terminateMySession(sessionId: string): Observable<void> {
    return this.apiService.delete<void>(`users/me/sessions/${sessionId}`);
  }

  /**
   * Terminate all user sessions
   */
  terminateAllUserSessions(id: string): Observable<void> {
    return this.apiService.delete<void>(`users/${id}/sessions`);
  }

  /**
   * Terminate all my sessions
   */
  terminateAllMySessions(): Observable<void> {
    return this.apiService.delete<void>(`users/me/sessions`);
  }

  /**
   * Bulk update users
   */
  bulkUpdateUsers(updates: Array<{ id: string; data: UpdateUserRequest }>): Observable<UserResponse[]> {
    return this.apiService.post<UserResponse[]>('users/bulk-update', { updates });
  }

  /**
   * Bulk delete users
   */
  bulkDeleteUsers(userIds: string[]): Observable<void> {
    return this.apiService.post<void>('users/bulk-delete', { userIds });
  }

  /**
   * Export users
   */
  exportUsers(filters: UserFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('users/export', 'users.xlsx');
  }

  /**
   * Import users
   */
  importUsers(file: File): Observable<{ success: number; errors: any[] }> {
    return this.apiService.uploadFile<{ success: number; errors: any[] }>('users/import', file);
  }

  /**
   * Get current users
   */
  getCurrentUsers(): UserResponse[] {
    return this.usersSubject.value;
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user stats
   */
  getCurrentUserStats(): UserStats | null {
    return this.userStatsSubject.value;
  }

  /**
   * Clear current user
   */
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  /**
   * Refresh users list
   */
  refreshUsers(filters: UserFilters = {}): void {
    this.getUsers(filters).subscribe();
  }

  /**
   * Refresh current user
   */
  refreshCurrentUser(): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      this.getUser(currentUser.id).subscribe();
    }
  }

  /**
   * Refresh user stats
   */
  refreshUserStats(): void {
    this.getUserStats().subscribe();
  }
}
