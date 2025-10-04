/**
 * Supplier Request DTOs with Zod validation
 */

import { z } from 'zod';
import { SupplierStatus, SupplierType } from '../../interfaces/supplier.interface';

// Base schemas
const supplierContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  position: z.string().max(100).optional(),
  isPrimary: z.boolean().default(false),
});

const supplierAddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória').max(200),
  number: z.string().min(1, 'Número é obrigatório').max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100),
  city: z.string().min(1, 'Cidade é obrigatória').max(100),
  state: z.string().min(2, 'Estado é obrigatório').max(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().min(2, 'País é obrigatório').max(100).default('Brasil'),
  isMainAddress: z.boolean().default(false),
});

const supplierPaymentTermsSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CREDIT', 'INSTALLMENTS']),
  creditLimit: z.number().min(0).optional(),
  paymentDays: z.number().min(0).max(365).default(30),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountDays: z.number().min(0).max(30).optional(),
});

const supplierRatingSchema = z.object({
  quality: z.number().min(1).max(5).default(3),
  delivery: z.number().min(1).max(5).default(3),
  communication: z.number().min(1).max(5).default(3),
  price: z.number().min(1).max(5).default(3),
});

// Create Supplier DTO
export const CreateSupplierRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  legalName: z.string().max(200).optional(),
  document: z.string().min(11, 'Documento inválido').max(18), // CPF or CNPJ
  type: z.nativeEnum(SupplierType),
  status: z.nativeEnum(SupplierStatus).default(SupplierStatus.ACTIVE),
  
  // Contact information
  contacts: z.array(supplierContactSchema).min(1, 'Pelo menos um contato é obrigatório'),
  addresses: z.array(supplierAddressSchema).min(1, 'Pelo menos um endereço é obrigatório'),
  
  // Business information
  website: z.string().url('Website inválido').optional(),
  description: z.string().max(1000).optional(),
  paymentTerms: supplierPaymentTermsSchema,
  rating: supplierRatingSchema.optional(),
  
  // Additional fields
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isPreferred: z.boolean().default(false),
});

export type CreateSupplierRequest = z.infer<typeof CreateSupplierRequestSchema>;

// Update Supplier DTO
export const UpdateSupplierRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200).optional(),
  legalName: z.string().max(200).optional(),
  document: z.string().min(11, 'Documento inválido').max(18).optional(),
  type: z.nativeEnum(SupplierType).optional(),
  status: z.nativeEnum(SupplierStatus).optional(),
  
  // Contact information
  contacts: z.array(supplierContactSchema).optional(),
  addresses: z.array(supplierAddressSchema).optional(),
  
  // Business information
  website: z.string().url('Website inválido').optional(),
  description: z.string().max(1000).optional(),
  paymentTerms: supplierPaymentTermsSchema.partial().optional(),
  rating: supplierRatingSchema.partial().optional(),
  
  // Additional fields
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isPreferred: z.boolean().optional(),
});

export type UpdateSupplierRequest = z.infer<typeof UpdateSupplierRequestSchema>;

// Supplier Search DTO
export const SupplierSearchRequestSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(SupplierType).optional(),
  status: z.nativeEnum(SupplierStatus).optional(),
  isPreferred: z.boolean().optional(),
  minRating: z.number().min(1).max(5).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'rating', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type SupplierSearchRequest = z.infer<typeof SupplierSearchRequestSchema>;

// Update Supplier Rating DTO
export const UpdateSupplierRatingRequestSchema = z.object({
  quality: z.number().min(1).max(5),
  delivery: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  price: z.number().min(1).max(5),
});

export type UpdateSupplierRatingRequest = z.infer<typeof UpdateSupplierRatingRequestSchema>;

