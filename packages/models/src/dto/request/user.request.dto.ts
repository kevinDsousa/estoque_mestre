/**
 * User Request DTOs with Zod validation
 */

import { z } from 'zod';
import { UserRole, UserStatus } from '../../interfaces/user.interface';

// Base schemas
const userProfileSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório').max(100),
  lastName: z.string().min(1, 'Sobrenome é obrigatório').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  preferences: z.record(z.any()).optional(),
});

const userPermissionsSchema = z.object({
  canCreateUsers: z.boolean().default(false),
  canDeleteUsers: z.boolean().default(false),
  canManageProducts: z.boolean().default(false),
  canManageCategories: z.boolean().default(false),
  canManageInventory: z.boolean().default(false),
  canViewReports: z.boolean().default(false),
  canManageCompany: z.boolean().default(false),
  canManageSuppliers: z.boolean().default(false),
  canManageCustomers: z.boolean().default(false),
});

// Create User DTO
export const CreateUserRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  companyId: z.string().uuid().optional(),
  profile: userProfileSchema,
  permissions: userPermissionsSchema.optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

// Update User DTO
export const UpdateUserRequestSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  companyId: z.string().uuid().optional(),
  profile: userProfileSchema.partial().optional(),
  permissions: userPermissionsSchema.partial().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

// Change Password DTO
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// Reset Password DTO
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// Confirm Reset Password DTO
export const ConfirmResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export type ConfirmResetPasswordRequest = z.infer<typeof ConfirmResetPasswordRequestSchema>;

// Login DTO
export const LoginRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().default(false),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Update Profile DTO
export const UpdateProfileRequestSchema = z.object({
  profile: userProfileSchema.partial(),
  preferences: z.record(z.any()).optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
