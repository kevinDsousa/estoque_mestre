/**
 * User Response DTOs
 */

import { z } from 'zod';
import { UserRole, UserStatus } from '../../interfaces/user.interface';

// Base schemas
const userProfileResponseSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  lastLoginAt: z.date().optional(),
  preferences: z.record(z.any()).optional(),
});

const userPermissionsResponseSchema = z.object({
  canCreateUsers: z.boolean(),
  canDeleteUsers: z.boolean(),
  canManageProducts: z.boolean(),
  canManageCategories: z.boolean(),
  canManageInventory: z.boolean(),
  canViewReports: z.boolean(),
  canManageCompany: z.boolean(),
  canManageSuppliers: z.boolean(),
  canManageCustomers: z.boolean(),
});

// User Response DTO
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  permissions: userPermissionsResponseSchema,
  profile: userProfileResponseSchema,
  companyId: z.string().uuid().optional(),
  lastLoginAt: z.date().optional(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// User List Response DTO
export const UserListResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  profile: userProfileResponseSchema,
  companyId: z.string().uuid().optional(),
  lastLoginAt: z.date().optional(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
});

export type UserListResponse = z.infer<typeof UserListResponseSchema>;

// Auth Response DTO
export const AuthResponseSchema = z.object({
  user: UserResponseSchema,
  token: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// User Profile Response DTO
export const UserProfileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  profile: userProfileResponseSchema,
  permissions: userPermissionsResponseSchema,
  companyId: z.string().uuid().optional(),
  lastLoginAt: z.date().optional(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

// User Session Response DTO
export const UserSessionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type UserSessionResponse = z.infer<typeof UserSessionResponseSchema>;

