import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import {
  LoginRequest,
  RegisterRequest,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  UpdateProfileRequest,
  AuthUser,
  LoginResponse,
  AuthState,
  RefreshTokenResponse
} from '../interfaces/auth.interface';

// Re-export interfaces for external use
export {
  LoginRequest,
  RegisterRequest,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  UpdateProfileRequest,
  AuthUser,
  LoginResponse,
  AuthState,
  RefreshTokenResponse
} from '../interfaces/auth.interface';


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
    refreshToken: null,
    expiresAt: null
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
        refreshToken,
        expiresAt: null
      });
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<any>('auth/login', credentials)
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const loginResponse: LoginResponse = {
            user: {
              id: response.user.id,
              email: response.user.email,
              role: response.user.role,
              status: 'ACTIVE',
              companyId: response.user.companyId,
              profile: {
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                email: response.user.email,
                phone: response.user.phone || '',
                avatar: response.user.avatar || ''
              },
              permissions: this.getUserPermissions(response.user.role),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresIn: 3600 // 1 hour default
          };
          return loginResponse;
        }),
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
   * Get user permissions based on role
   */
  private getUserPermissions(role: string): any {
    const permissions: any = {
      canCreateUsers: false,
      canDeleteUsers: false,
      canManageProducts: false,
      canManageCategories: false,
      canManageInventory: false,
      canViewReports: false,
      canManageCompany: false,
      canManageSuppliers: false,
      canManageCustomers: false,
    };

    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        Object.keys(permissions).forEach(key => {
          permissions[key] = true;
        });
        break;
      case 'MANAGER':
        permissions.canManageProducts = true;
        permissions.canManageCategories = true;
        permissions.canManageInventory = true;
        permissions.canViewReports = true;
        permissions.canManageSuppliers = true;
        permissions.canManageCustomers = true;
        break;
      case 'EMPLOYEE':
        permissions.canManageProducts = true;
        permissions.canManageInventory = true;
        permissions.canViewReports = true;
        break;
    }

    return permissions;
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<UserResponse> {
    return this.apiService.post<any>('auth/register', userData)
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const userResponse: UserResponse = {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role,
            status: 'ACTIVE',
            companyId: response.user.companyId,
            profile: {
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              email: response.user.email,
              phone: response.user.phone || '',
              avatar: response.user.avatar || ''
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return userResponse;
        }),
        catchError(error => throwError(() => error))
      );
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
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<any>('auth/refresh', { refreshToken })
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const refreshResponse: RefreshTokenResponse = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token || refreshToken,
            expiresIn: 3600 // 1 hour default
          };
          return refreshResponse;
        }),
        tap(response => {
          // Update stored tokens
          this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
          if (response.refreshToken) {
            this.storageService.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          }
          
          // Update auth state
          const currentState = this.authStateSubject.value;
          if (currentState.isAuthenticated) {
            this.authStateSubject.next({
              ...currentState,
              token: response.accessToken,
              refreshToken: response.refreshToken,
              expiresAt: Date.now() + (response.expiresIn * 1000)
            });
          }
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
    return this.apiService.post<void>('auth/reset-password', {
      token: confirmData.token,
      newPassword: confirmData.newPassword
    });
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: UpdateProfileRequest): Observable<UserResponse> {
    return this.apiService.patch<any>('auth/profile', profileData)
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const userResponse: UserResponse = {
            id: response.id,
            email: response.email,
            role: response.role,
            status: response.status,
            companyId: response.companyId,
            profile: {
              firstName: response.firstName,
              lastName: response.lastName,
              email: response.email,
              phone: response.phone || '',
              avatar: response.avatar || ''
            },
            createdAt: response.createdAt,
            updatedAt: response.updatedAt
          };
          return userResponse;
        }),
        tap(user => {
          const currentState = this.authStateSubject.value;
          if (currentState.user) {
            const updatedUser = { 
              ...currentState.user, 
              profile: {
                ...currentState.user.profile,
                ...user.profile
              }
            };
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
    return this.apiService.get<any>('auth/profile')
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const userResponse: UserResponse = {
            id: response.id,
            email: response.email,
            role: response.role,
            status: response.status,
            companyId: response.companyId,
            profile: {
              firstName: response.firstName,
              lastName: response.lastName,
              email: response.email,
              phone: response.phone || '',
              avatar: response.avatar || ''
            },
            createdAt: response.createdAt,
            updatedAt: response.updatedAt
          };
          return userResponse;
        })
      );
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
      refreshToken: response.refreshToken,
      expiresAt: Date.now() + (response.expiresIn * 1000)
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
      refreshToken: null,
      expiresAt: null
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
