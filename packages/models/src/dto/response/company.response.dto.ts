/**
 * Company Response DTOs
 */

import { z } from 'zod';
import { CompanyStatus, CompanyType } from '../../interfaces/company.interface';

// Base schemas
const companyAddressResponseSchema = z.object({
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
});

const companyContactResponseSchema = z.object({
  email: z.string().email(),
  phone: z.string(),
  website: z.string().url().optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
});

const companySettingsResponseSchema = z.object({
  timezone: z.string(),
  currency: z.string(),
  language: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  inventorySettings: z.object({
    lowStockThreshold: z.number(),
    autoReorderEnabled: z.boolean(),
    trackExpiration: z.boolean(),
  }),
  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    lowStockAlerts: z.boolean(),
    expirationAlerts: z.boolean(),
  }),
});

// Company Response DTO
export const CompanyResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string(),
  document: z.string(),
  type: z.nativeEnum(CompanyType),
  status: z.nativeEnum(CompanyStatus),
  address: companyAddressResponseSchema,
  contact: companyContactResponseSchema,
  settings: companySettingsResponseSchema,
  logo: z.string().url().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  foundedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CompanyResponse = z.infer<typeof CompanyResponseSchema>;

// Company List Response DTO
export const CompanyListResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string(),
  document: z.string(),
  type: z.nativeEnum(CompanyType),
  status: z.nativeEnum(CompanyStatus),
  address: companyAddressResponseSchema,
  contact: companyContactResponseSchema,
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  createdAt: z.date(),
});

export type CompanyListResponse = z.infer<typeof CompanyListResponseSchema>;

// Company Settings Response DTO
export const CompanySettingsResponseSchema = z.object({
  settings: companySettingsResponseSchema,
});

export type CompanySettingsResponse = z.infer<typeof CompanySettingsResponseSchema>;

