/**
 * Catalog Response DTOs
 */

import { z } from 'zod';
import { CatalogType, CatalogStatus } from '../../interfaces/catalog.interface';

// Base schemas
const catalogMetadataResponseSchema = z.record(z.any()).optional();

// Catalog Response DTO
export const CatalogResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(CatalogType),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  companyId: z.string().uuid(),
  status: z.nativeEnum(CatalogStatus),
  
  // Metadata for specific types
  metadata: catalogMetadataResponseSchema,
  
  // Hierarchy support
  parentId: z.string().uuid().optional(),
  level: z.number(),
  path: z.array(z.string()),
  fullPath: z.string(),
  
  // Ordering and defaults
  sortOrder: z.number(),
  isDefault: z.boolean(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CatalogResponse = z.infer<typeof CatalogResponseSchema>;

// Catalog List Response DTO
export const CatalogListResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(CatalogType),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  companyId: z.string().uuid(),
  status: z.nativeEnum(CatalogStatus),
  
  // Hierarchy support
  parentId: z.string().uuid().optional(),
  level: z.number(),
  fullPath: z.string(),
  
  // Ordering and defaults
  sortOrder: z.number(),
  isDefault: z.boolean(),
  
  // Timestamps
  createdAt: z.date(),
});

export type CatalogListResponse = z.infer<typeof CatalogListResponseSchema>;

// Catalog Tree Response DTO
export const CatalogTreeResponseSchema: z.ZodType<any> = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(CatalogType),
  name: z.string(),
  code: z.string(),
  status: z.nativeEnum(CatalogStatus),
  parentId: z.string().uuid().optional(),
  level: z.number(),
  fullPath: z.string(),
  sortOrder: z.number(),
  isDefault: z.boolean(),
  children: z.array(z.lazy((): z.ZodType<any> => CatalogTreeResponseSchema)).optional(),
});

export type CatalogTreeResponse = z.infer<typeof CatalogTreeResponseSchema>;

// Catalog Summary Response DTO
export const CatalogSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(CatalogType),
  name: z.string(),
  code: z.string(),
  status: z.nativeEnum(CatalogStatus),
  level: z.number(),
  isDefault: z.boolean(),
  hasChildren: z.boolean(),
});

export type CatalogSummaryResponse = z.infer<typeof CatalogSummaryResponseSchema>;

// Currency specific response DTOs
export const CurrencyResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimalPlaces: z.number(),
  isDefault: z.boolean(),
  exchangeRate: z.number().optional(),
  lastUpdated: z.date().optional(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CurrencyResponse = z.infer<typeof CurrencyResponseSchema>;

// Sector specific response DTOs
export const SectorResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  level: z.number(),
  path: z.array(z.string()),
  fullPath: z.string(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SectorResponse = z.infer<typeof SectorResponseSchema>;

// Brand specific response DTOs
export const BrandResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  country: z.string().optional(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BrandResponse = z.infer<typeof BrandResponseSchema>;

// Unit of Measure specific response DTOs
export const UnitOfMeasureResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  symbol: z.string(),
  type: z.enum(['WEIGHT', 'VOLUME', 'LENGTH', 'AREA', 'QUANTITY', 'TIME', 'OTHER']),
  baseUnit: z.string().optional(),
  conversionFactor: z.number().optional(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UnitOfMeasureResponse = z.infer<typeof UnitOfMeasureResponseSchema>;

// Payment Term specific response DTOs
export const PaymentTermResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  days: z.number(),
  description: z.string().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PaymentTermResponse = z.infer<typeof PaymentTermResponseSchema>;

// Document Type specific response DTOs
export const DocumentTypeResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  format: z.string(),
  mask: z.string(),
  description: z.string().optional(),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DocumentTypeResponse = z.infer<typeof DocumentTypeResponseSchema>;

// Vehicle Make specific response DTOs
export const VehicleMakeResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  country: z.string().optional(),
  logo: z.string().url().optional(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VehicleMakeResponse = z.infer<typeof VehicleMakeResponseSchema>;

// Vehicle Model specific response DTOs
export const VehicleModelResponseSchema = z.object({
  id: z.string().uuid(),
  makeId: z.string().uuid(),
  makeName: z.string(),
  name: z.string(),
  code: z.string(),
  yearFrom: z.number().optional(),
  yearTo: z.number().optional(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VehicleModelResponse = z.infer<typeof VehicleModelResponseSchema>;

// Vehicle Year specific response DTOs
export const VehicleYearResponseSchema = z.object({
  id: z.string().uuid(),
  modelId: z.string().uuid(),
  modelName: z.string(),
  year: z.number(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VehicleYearResponse = z.infer<typeof VehicleYearResponseSchema>;

// Engine Type specific response DTOs
export const EngineTypeResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  displacement: z.number().optional(),
  cylinders: z.number().optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ETHANOL', 'FLEX', 'ELECTRIC', 'HYBRID']).optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EngineTypeResponse = z.infer<typeof EngineTypeResponseSchema>;
