/**
 * Catalog Request DTOs with Zod validation
 */

import { z } from 'zod';
import { CatalogType, CatalogStatus } from '../../interfaces/catalog.interface';

// Base schemas
const catalogMetadataSchema = z.record(z.any()).optional();

// Create Catalog DTO
export const CreateCatalogRequestSchema = z.object({
  type: z.nativeEnum(CatalogType),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(CatalogStatus).default(CatalogStatus.ACTIVE),
  
  // Metadata for specific types
  metadata: catalogMetadataSchema,
  
  // Hierarchy support
  parentId: z.string().uuid('ID do pai inválido').optional(),
  
  // Ordering and defaults
  sortOrder: z.number().min(0).default(0),
  isDefault: z.boolean().default(false),
});

export type CreateCatalogRequest = z.infer<typeof CreateCatalogRequestSchema>;

// Update Catalog DTO
export const UpdateCatalogRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200).optional(),
  code: z.string().min(1, 'Código é obrigatório').max(50).optional(),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(CatalogStatus).optional(),
  
  // Metadata for specific types
  metadata: catalogMetadataSchema,
  
  // Hierarchy support
  parentId: z.string().uuid('ID do pai inválido').optional(),
  
  // Ordering and defaults
  sortOrder: z.number().min(0).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateCatalogRequest = z.infer<typeof UpdateCatalogRequestSchema>;

// Catalog Search DTO
export const CatalogSearchRequestSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(CatalogType).optional(),
  status: z.nativeEnum(CatalogStatus).optional(),
  parentId: z.string().uuid().optional(),
  isDefault: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'code', 'sortOrder', 'createdAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CatalogSearchRequest = z.infer<typeof CatalogSearchRequestSchema>;

// Currency specific DTOs
export const CreateCurrencyRequestSchema = z.object({
  code: z.string().min(3, 'Código deve ter pelo menos 3 caracteres').max(3, 'Código deve ter no máximo 3 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  symbol: z.string().min(1, 'Símbolo é obrigatório').max(10),
  decimalPlaces: z.number().min(0).max(4).default(2),
  isDefault: z.boolean().default(false),
  exchangeRate: z.number().min(0).optional(),
});

export type CreateCurrencyRequest = z.infer<typeof CreateCurrencyRequestSchema>;

// Sector specific DTOs
export const CreateSectorRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  description: z.string().max(1000).optional(),
  parentId: z.string().uuid('ID do pai inválido').optional(),
});

export type CreateSectorRequest = z.infer<typeof CreateSectorRequestSchema>;

// Brand specific DTOs
export const CreateBrandRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  description: z.string().max(1000).optional(),
  logo: z.string().url('URL do logo inválida').optional(),
  website: z.string().url('URL do website inválida').optional(),
  country: z.string().max(100).optional(),
});

export type CreateBrandRequest = z.infer<typeof CreateBrandRequestSchema>;

// Unit of Measure specific DTOs
export const CreateUnitOfMeasureRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(20),
  symbol: z.string().min(1, 'Símbolo é obrigatório').max(10),
  type: z.enum(['WEIGHT', 'VOLUME', 'LENGTH', 'AREA', 'QUANTITY', 'TIME', 'OTHER']),
  baseUnit: z.string().max(20).optional(),
  conversionFactor: z.number().min(0).optional(),
});

export type CreateUnitOfMeasureRequest = z.infer<typeof CreateUnitOfMeasureRequestSchema>;

// Payment Term specific DTOs
export const CreatePaymentTermRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  days: z.number().min(0).max(365),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
});

export type CreatePaymentTermRequest = z.infer<typeof CreatePaymentTermRequestSchema>;

// Document Type specific DTOs
export const CreateDocumentTypeRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  format: z.string().min(1, 'Formato é obrigatório'),
  mask: z.string().min(1, 'Máscara é obrigatória'),
  description: z.string().max(500).optional(),
  isRequired: z.boolean().default(false),
});

export type CreateDocumentTypeRequest = z.infer<typeof CreateDocumentTypeRequestSchema>;

// Vehicle Make specific DTOs
export const CreateVehicleMakeRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  country: z.string().max(100).optional(),
  logo: z.string().url('URL do logo inválida').optional(),
});

export type CreateVehicleMakeRequest = z.infer<typeof CreateVehicleMakeRequestSchema>;

// Vehicle Model specific DTOs
export const CreateVehicleModelRequestSchema = z.object({
  makeId: z.string().uuid('ID da marca inválido'),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  yearFrom: z.number().min(1900).max(2100).optional(),
  yearTo: z.number().min(1900).max(2100).optional(),
});

export type CreateVehicleModelRequest = z.infer<typeof CreateVehicleModelRequestSchema>;

// Vehicle Year specific DTOs
export const CreateVehicleYearRequestSchema = z.object({
  modelId: z.string().uuid('ID do modelo inválido'),
  year: z.number().min(1900).max(2100),
});

export type CreateVehicleYearRequest = z.infer<typeof CreateVehicleYearRequestSchema>;

// Engine Type specific DTOs
export const CreateEngineTypeRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(50),
  displacement: z.number().min(0).optional(),
  cylinders: z.number().min(1).max(16).optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ETHANOL', 'FLEX', 'ELECTRIC', 'HYBRID']).optional(),
  description: z.string().max(500).optional(),
});

export type CreateEngineTypeRequest = z.infer<typeof CreateEngineTypeRequestSchema>;

