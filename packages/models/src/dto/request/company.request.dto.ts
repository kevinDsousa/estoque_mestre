/**
 * Company Request DTOs with Zod validation
 */

import { z } from 'zod';
import { CompanyStatus, CompanyType } from '../../interfaces/company.interface';

// Base schemas
const companyAddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória').max(200),
  number: z.string().min(1, 'Número é obrigatório').max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100),
  city: z.string().min(1, 'Cidade é obrigatória').max(100),
  state: z.string().min(2, 'Estado é obrigatório').max(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().min(2, 'País é obrigatório').max(100).default('Brasil'),
});

const companyContactSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  website: z.string().url('Website inválido').optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
});

const companySettingsSchema = z.object({
  timezone: z.string().default('America/Sao_Paulo'),
  currency: z.string().default('BRL'),
  language: z.string().default('pt-BR'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  timeFormat: z.string().default('24h'),
  inventorySettings: z.object({
    lowStockThreshold: z.number().min(0).default(10),
    autoReorderEnabled: z.boolean().default(false),
    trackExpiration: z.boolean().default(false),
  }),
  notificationSettings: z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    lowStockAlerts: z.boolean().default(true),
    expirationAlerts: z.boolean().default(true),
  }),
});

// Create Company DTO
export const CreateCompanyRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  legalName: z.string().min(1, 'Razão social é obrigatória').max(200),
  document: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
  type: z.nativeEnum(CompanyType),
  status: z.nativeEnum(CompanyStatus).default(CompanyStatus.PENDING_APPROVAL),
  address: companyAddressSchema,
  contact: companyContactSchema,
  settings: companySettingsSchema.optional(),
  logo: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional(),
  foundedAt: z.string().datetime().optional(),
});

export type CreateCompanyRequest = z.infer<typeof CreateCompanyRequestSchema>;

// Update Company DTO
export const UpdateCompanyRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200).optional(),
  legalName: z.string().min(1, 'Razão social é obrigatória').max(200).optional(),
  document: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional(),
  type: z.nativeEnum(CompanyType).optional(),
  status: z.nativeEnum(CompanyStatus).optional(),
  address: companyAddressSchema.partial().optional(),
  contact: companyContactSchema.partial().optional(),
  settings: companySettingsSchema.partial().optional(),
  logo: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional(),
  foundedAt: z.string().datetime().optional(),
});

export type UpdateCompanyRequest = z.infer<typeof UpdateCompanyRequestSchema>;

// Company Settings Update DTO
export const UpdateCompanySettingsRequestSchema = z.object({
  settings: companySettingsSchema.partial(),
});

export type UpdateCompanySettingsRequest = z.infer<typeof UpdateCompanySettingsRequestSchema>;

