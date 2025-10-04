/**
 * Transaction Response DTOs
 */

import { z } from 'zod';
import { TransactionType, TransactionStatus, PaymentStatus } from '../../interfaces/transaction.interface';

// Base schemas
const transactionItemResponseSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  discount: z.number().optional(),
  notes: z.string().optional(),
});

const transactionPaymentResponseSchema = z.object({
  method: z.enum(['CASH', 'CREDIT', 'PIX', 'CARD', 'TRANSFER']),
  amount: z.number(),
  reference: z.string().optional(),
  processedAt: z.date().optional(),
});

const transactionSummaryResponseSchema = z.object({
  subtotal: z.number(),
  discount: z.number(),
  tax: z.number(),
  total: z.number(),
  itemsCount: z.number(),
});

// Transaction Response DTO
export const TransactionResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  companyId: z.string().uuid(),
  
  // Related entities
  customerId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  
  // Transaction details
  items: z.array(transactionItemResponseSchema),
  payments: z.array(transactionPaymentResponseSchema),
  summary: transactionSummaryResponseSchema,
  
  // Additional information
  reference: z.string().optional(),
  notes: z.string().optional(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  shippingCost: z.number().optional(),
  
  // Dates
  transactionDate: z.date(),
  dueDate: z.date().optional(),
  paidAt: z.date().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;

// Transaction List Response DTO
export const TransactionListResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  companyId: z.string().uuid(),
  
  // Related entities
  customerId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  
  // Transaction details
  summary: transactionSummaryResponseSchema,
  
  // Additional information
  reference: z.string().optional(),
  
  // Dates
  transactionDate: z.date(),
  dueDate: z.date().optional(),
  paidAt: z.date().optional(),
  
  createdAt: z.date(),
});

export type TransactionListResponse = z.infer<typeof TransactionListResponseSchema>;

// Transaction Summary Response DTO
export const TransactionSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  total: z.number(),
  itemsCount: z.number(),
  reference: z.string().optional(),
  transactionDate: z.date(),
  dueDate: z.date().optional(),
  paidAt: z.date().optional(),
  isOverdue: z.boolean(),
  daysOverdue: z.number(),
});

export type TransactionSummaryResponse = z.infer<typeof TransactionSummaryResponseSchema>;

// Transaction Payment Response DTO
export const TransactionPaymentResponseSchema = z.object({
  payments: z.array(transactionPaymentResponseSchema),
  totalPaid: z.number(),
  remainingAmount: z.number(),
  paymentStatus: z.nativeEnum(PaymentStatus),
});

export type TransactionPaymentResponse = z.infer<typeof TransactionPaymentResponseSchema>;

