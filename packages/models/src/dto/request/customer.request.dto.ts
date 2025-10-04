/**
 * Customer Request DTOs with Zod validation
 */

import { z } from 'zod';
import { CustomerStatus, CustomerType } from '../../interfaces/customer.interface';

// Base schemas
const customerContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  position: z.string().max(100).optional(),
  isPrimary: z.boolean().default(false),
});

const customerAddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória').max(200),
  number: z.string().min(1, 'Número é obrigatório').max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100),
  city: z.string().min(1, 'Cidade é obrigatória').max(100),
  state: z.string().min(2, 'Estado é obrigatório').max(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().min(2, 'País é obrigatório').max(100).default('Brasil'),
  isMainAddress: z.boolean().default(false),
  type: z.enum(['BILLING', 'SHIPPING', 'BOTH']),
});

const customerPaymentInfoSchema = z.object({
  preferredPaymentMethod: z.enum(['CASH', 'CREDIT', 'PIX', 'CARD']),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).max(365).optional(),
  hasOutstandingBalance: z.boolean().default(false),
  outstandingAmount: z.number().min(0).optional(),
});

const customerPreferencesSchema = z.object({
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS']).default('EMAIL'),
  receivePromotions: z.boolean().default(false),
  receiveNewsletter: z.boolean().default(false),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
});

// Create Customer DTO
export const CreateCustomerRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  legalName: z.string().max(200).optional(),
  document: z.string().min(11, 'Documento inválido').max(18), // CPF or CNPJ
  type: z.nativeEnum(CustomerType),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.ACTIVE),
  
  // Contact information
  contacts: z.array(customerContactSchema).min(1, 'Pelo menos um contato é obrigatório'),
  addresses: z.array(customerAddressSchema).min(1, 'Pelo menos um endereço é obrigatório'),
  
  // Business information
  website: z.string().url('Website inválido').optional(),
  description: z.string().max(1000).optional(),
  paymentInfo: customerPaymentInfoSchema.optional(),
  preferences: customerPreferencesSchema.optional(),
  
  // Additional fields
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  birthDate: z.string().datetime().optional(), // for individuals
  isVip: z.boolean().default(false),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;

// Update Customer DTO
export const UpdateCustomerRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200).optional(),
  legalName: z.string().max(200).optional(),
  document: z.string().min(11, 'Documento inválido').max(18).optional(),
  type: z.nativeEnum(CustomerType).optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  
  // Contact information
  contacts: z.array(customerContactSchema).optional(),
  addresses: z.array(customerAddressSchema).optional(),
  
  // Business information
  website: z.string().url('Website inválido').optional(),
  description: z.string().max(1000).optional(),
  paymentInfo: customerPaymentInfoSchema.partial().optional(),
  preferences: customerPreferencesSchema.partial().optional(),
  
  // Additional fields
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  birthDate: z.string().datetime().optional(),
  isVip: z.boolean().optional(),
});

export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerRequestSchema>;

// Customer Search DTO
export const CustomerSearchRequestSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(CustomerType).optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  isVip: z.boolean().optional(),
  hasOutstandingBalance: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'totalPurchases', 'lastPurchaseAt', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CustomerSearchRequest = z.infer<typeof CustomerSearchRequestSchema>;

// Customer Payment Update DTO
export const UpdateCustomerPaymentRequestSchema = z.object({
  paymentInfo: customerPaymentInfoSchema.partial(),
});

export type UpdateCustomerPaymentRequest = z.infer<typeof UpdateCustomerPaymentRequestSchema>;
