/**
 * Supplier Response DTOs
 */

import { z } from 'zod';
import { SupplierStatus, SupplierType } from '../../interfaces/supplier.interface';

// Base schemas
const supplierContactResponseSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  position: z.string().optional(),
  isPrimary: z.boolean(),
});

const supplierAddressResponseSchema = z.object({
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  isMainAddress: z.boolean(),
});

const supplierPaymentTermsResponseSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CREDIT', 'INSTALLMENTS']),
  creditLimit: z.number().optional(),
  paymentDays: z.number(),
  discountPercentage: z.number().optional(),
  discountDays: z.number().optional(),
});

const supplierRatingResponseSchema = z.object({
  quality: z.number(),
  delivery: z.number(),
  communication: z.number(),
  price: z.number(),
  overall: z.number(),
  lastUpdated: z.date(),
});

// Supplier Response DTO
export const SupplierResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string().optional(),
  document: z.string(),
  type: z.nativeEnum(SupplierType),
  status: z.nativeEnum(SupplierStatus),
  companyId: z.string().uuid(),
  
  // Contact information
  contacts: z.array(supplierContactResponseSchema),
  addresses: z.array(supplierAddressResponseSchema),
  
  // Business information
  website: z.string().url().optional(),
  description: z.string().optional(),
  paymentTerms: supplierPaymentTermsResponseSchema,
  rating: supplierRatingResponseSchema,
  
  // Additional fields
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPreferred: z.boolean(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SupplierResponse = z.infer<typeof SupplierResponseSchema>;

// Supplier List Response DTO
export const SupplierListResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string().optional(),
  document: z.string(),
  type: z.nativeEnum(SupplierType),
  status: z.nativeEnum(SupplierStatus),
  companyId: z.string().uuid(),
  
  // Contact information
  contacts: z.array(supplierContactResponseSchema),
  addresses: z.array(supplierAddressResponseSchema),
  
  // Business information
  website: z.string().url().optional(),
  rating: supplierRatingResponseSchema,
  
  // Additional fields
  isPreferred: z.boolean(),
  
  createdAt: z.date(),
});

export type SupplierListResponse = z.infer<typeof SupplierListResponseSchema>;

// Supplier Summary Response DTO
export const SupplierSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string().optional(),
  type: z.nativeEnum(SupplierType),
  status: z.nativeEnum(SupplierStatus),
  overallRating: z.number(),
  isPreferred: z.boolean(),
  primaryContact: supplierContactResponseSchema.optional(),
  mainAddress: supplierAddressResponseSchema.optional(),
});

export type SupplierSummaryResponse = z.infer<typeof SupplierSummaryResponseSchema>;

// Supplier Rating Response DTO
export const SupplierRatingResponseSchema = z.object({
  rating: supplierRatingResponseSchema,
});

export type SupplierRatingResponse = z.infer<typeof SupplierRatingResponseSchema>;

