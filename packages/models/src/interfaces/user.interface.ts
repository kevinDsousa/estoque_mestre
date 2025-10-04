/**
 * User related interfaces
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION'
}

export interface IUserPermissions {
  canCreateUsers: boolean;
  canDeleteUsers: boolean;
  canManageProducts: boolean;
  canManageCategories: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canManageCompany: boolean;
  canManageSuppliers: boolean;
  canManageCustomers: boolean;
}

export interface IUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: IUserAvatar;
  lastLoginAt?: Date;
  preferences?: Record<string, any>;
}

export interface IUserAvatar {
  id: string;
  url: string;
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
  };
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
  };
  uploadedAt: Date;
}

export interface IUserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ipAddress?: string;
}
