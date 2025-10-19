import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { 
  LoginRequest, 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  UpdateProfileRequest
} from '@estoque-mestre/models';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status: string;
  companyId?: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  permissions: {
    canCreateUsers: boolean;
    canDeleteUsers: boolean;
    canManageProducts: boolean;
    canManageCategories: boolean;
    canManageInventory: boolean;
    canViewReports: boolean;
    canManageCompany: boolean;
    canManageSuppliers: boolean;
    canManageCustomers: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'auth_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuth(): void {
    const token = this.storageService.getItem(this.TOKEN_KEY);
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    const user = this.storageService.getItem(this.USER_KEY);

    if (token && user) {
      this.authStateSubject.next({
        isAuthenticated: true,
        user: JSON.parse(user),
        token,
        refreshToken
      });
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', credentials)
      .pipe(
        tap(response => {
          this.setAuthState(response);
          this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
          this.storageService.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          this.storageService.setItem(this.USER_KEY, JSON.stringify(response.user));
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: CreateUserRequest): Observable<UserResponse> {
    return this.apiService.post<UserResponse>('auth/register', userData);
  }

  /**
   * Logout user
   */
  logout(): void {
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    
    if (refreshToken) {
      this.apiService.post('auth/logout', { refreshToken }).subscribe({
        error: () => {
          // Continue with logout even if API call fails
        }
      });
    }

    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<LoginResponse>('auth/refresh', { refreshToken })
      .pipe(
        tap(response => {
          this.setAuthState(response);
          this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
          this.storageService.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          this.storageService.setItem(this.USER_KEY, JSON.stringify(response.user));
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Change password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<void> {
    return this.apiService.post<void>('auth/change-password', passwordData);
  }

  /**
   * Reset password request
   */
  requestPasswordReset(resetData: ResetPasswordRequest): Observable<void> {
    return this.apiService.post<void>('auth/forgot-password', resetData);
  }

  /**
   * Confirm password reset
   */
  confirmPasswordReset(confirmData: ConfirmResetPasswordRequest): Observable<void> {
    return this.apiService.post<void>('auth/reset-password', confirmData);
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: UpdateProfileRequest): Observable<UserResponse> {
    return this.apiService.patch<UserResponse>('auth/profile', profileData)
      .pipe(
        tap(user => {
          const currentState = this.authStateSubject.value;
          if (currentState.user) {
            const updatedUser = { ...currentState.user, ...user };
            this.authStateSubject.next({
              ...currentState,
              user: updatedUser
            });
            this.storageService.setItem(this.USER_KEY, JSON.stringify(updatedUser));
          }
        })
      );
  }

  /**
   * Get current user
   */
  getCurrentUser(): Observable<UserResponse> {
    return this.apiService.get<UserResponse>('auth/me');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUserSync(): AuthUser | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: keyof AuthUser['permissions']): boolean {
    const user = this.getCurrentUserSync();
    return user?.permissions?.[permission] || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUserSync();
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('SUPER_ADMIN');
  }

  /**
   * Check if user is manager
   */
  isManager(): boolean {
    return this.hasRole('MANAGER');
  }

  /**
   * Check if user is employee
   */
  isEmployee(): boolean {
    return this.hasRole('EMPLOYEE');
  }

  /**
   * Get user's company ID
   */
  getCompanyId(): string | null {
    const user = this.getCurrentUserSync();
    return user?.companyId || null;
  }

  /**
   * Set authentication state
   */
  private setAuthState(response: LoginResponse): void {
    this.authStateSubject.next({
      isAuthenticated: true,
      user: response.user,
      token: response.accessToken,
      refreshToken: response.refreshToken
    });
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
    
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null
    });
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): Date | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
}
