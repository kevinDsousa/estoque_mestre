import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';

export interface AuthContext {
  userId: string;
  companyId: string;
  role: string;
  email: string;
}

@Injectable({ scope: Scope.REQUEST })
export class AuthContextService {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  getAuthContext(): AuthContext | null {
    return this.request.authContext || null;
  }

  getUserId(): string | null {
    return this.request.authContext?.userId || null;
  }

  getCompanyId(): string | null {
    return this.request.authContext?.companyId || null;
  }

  getRole(): string | null {
    return this.request.authContext?.role || null;
  }

  getEmail(): string | null {
    return this.request.authContext?.email || null;
  }

  isAdmin(): boolean {
    return this.request.authContext?.role === 'ADMIN';
  }

  isManager(): boolean {
    return this.request.authContext?.role === 'MANAGER';
  }

  isEmployee(): boolean {
    return this.request.authContext?.role === 'EMPLOYEE';
  }

  hasRole(role: string): boolean {
    return this.request.authContext?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.request.authContext?.role);
  }
}

