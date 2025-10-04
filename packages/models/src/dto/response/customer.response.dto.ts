/**
 * Customer Response DTOs
 */

import { z } from 'zod';
import { CustomerStatus, CustomerType } from '../../interfaces/customer.interface';

// Base schemas
const customerContactResponseSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  position: z.string().optional(),
  isPrimary: z.boolean(),
});

const customerAddressResponseSchema = z.object({
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  isMainAddress: z.boolean(),
  type: z.enum(['BILLING', 'SHIPPING', 'BOTH']),
});

const customerPaymentInfoResponseSchema = z.object({
  preferredPaymentMethod: z.enum(['CASH', 'CREDIT', 'PIX', 'CARD']),
  creditLimit: z.number().optional(),
  paymentTerms: z.number().optional(),
  hasOutstandingBalance: z.boolean(),
  outstandingAmount: z.number().optional(),
});

const customerPreferencesResponseSchema = z.object({
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS']),
  receivePromotions: z.boolean(),
  receiveNewsletter: z.boolean(),
  language: z.string(),
  timezone: z.string(),
});

// Customer Response DTO
export const CustomerResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string().optional(),
  document: z.string(),
  type: z.nativeEnum(CustomerType),
  status: z.nativeEnum(CustomerStatus),
  companyId: z.string().uuid(),
  
  // Contact information
  contacts: z.array(customerContactResponseSchema),
  addresses: z.array(customerAddressResponseSchema),
  
  // Business information
  website: z.string().url().optional(),
  description: z.string().optional(),
  paymentInfo: customerPaymentInfoResponseSchema,
  preferences: customerPreferencesResponseSchema,
  
  // Additional fields
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  birthDate: z.date().optional(),
  isVip: z.boolean(),
  totalPurchases: z.number(),
  lastPurchaseAt: z.date().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CustomerResponse = z.infer<typeof CustomerResponseSchema>;

// Customer List Response DTO
export const CustomerListResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string().optional(),
  document: z.string(),
  type: z.nativeEnum(CustomerType),
  status: z.nativeEnum(CustomerStatus),
  companyId: z.string().uuid(),
  
  // Contact information
  contacts: z.array(customerContactResponseSchema),
  addresses: z.array(customerAddressResponseSchema),
  
  // Business information
  website: z.string().url().optional(),
  paymentInfo: customerPaymentInfoResponseSchema,
  
  // Additional fields
  isVip: z.boolean(),
  totalPurchases: z.number(),
  lastPurchaseAt: z.date().optional(),
  
  createdAt: z.date(),
});

export type CustomerListResponse = z.infer<typeof CustomerListResponseSchema>;

// Customer Summary Response DTO
export const CustomerSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legalName: z.string().optional(),
  type: z.nativeEnum(CustomerType),
  status: z.nativeEnum(CustomerStatus),
  isVip: z.boolean(),
  totalPurchases: z.number(),
  lastPurchaseAt: z.date().optional(),
  hasOutstandingBalance: z.boolean(),
  outstandingAmount: z.number().optional(),
  primaryContact: customerContactResponseSchema.optional(),
  billingAddress: customerAddressResponseSchema.optional(),
});

export type CustomerSummaryResponse = z.infer<typeof CustomerSummaryResponseSchema>;

// Customer Payment Info Response DTO
export const CustomerPaymentInfoResponseSchema = z.object({
  paymentInfo: customerPaymentInfoResponseSchema,
});

export type CustomerPaymentInfoResponse = z.infer<typeof CustomerPaymentInfoResponseSchema>;

