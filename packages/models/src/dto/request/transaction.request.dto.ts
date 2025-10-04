/**
 * Transaction Request DTOs with Zod validation
 */

import { z } from 'zod';
import { TransactionType, TransactionStatus, PaymentStatus } from '../../interfaces/transaction.interface';

// Base schemas
const transactionItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  unitPrice: z.number().min(0, 'Preço unitário deve ser positivo'),
  discount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

const transactionPaymentSchema = z.object({
  method: z.enum(['CASH', 'CREDIT', 'PIX', 'CARD', 'TRANSFER']),
  amount: z.number().min(0, 'Valor deve ser positivo'),
  reference: z.string().max(200).optional(),
});

// Create Transaction DTO
export const CreateTransactionRequestSchema = z.object({
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDING),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  
  // Related entities
  customerId: z.string().uuid('ID do cliente inválido').optional(),
  supplierId: z.string().uuid('ID do fornecedor inválido').optional(),
  
  // Transaction details
  items: z.array(transactionItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  payments: z.array(transactionPaymentSchema).optional(),
  
  // Additional information
  reference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
  
  // Dates
  transactionDate: z.string().datetime().default(() => new Date().toISOString()),
  dueDate: z.string().datetime().optional(),
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>;

// Update Transaction DTO
export const UpdateTransactionRequestSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  
  // Related entities
  customerId: z.string().uuid('ID do cliente inválido').optional(),
  supplierId: z.string().uuid('ID do fornecedor inválido').optional(),
  
  // Transaction details
  items: z.array(transactionItemSchema).optional(),
  payments: z.array(transactionPaymentSchema).optional(),
  
  // Additional information
  reference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
  
  // Dates
  transactionDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  paidAt: z.string().datetime().optional(),
});

export type UpdateTransactionRequest = z.infer<typeof UpdateTransactionRequestSchema>;

// Transaction Search DTO
export const TransactionSearchRequestSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  customerId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['transactionDate', 'total', 'status', 'createdAt']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TransactionSearchRequest = z.infer<typeof TransactionSearchRequestSchema>;

// Add Payment DTO
export const AddPaymentRequestSchema = z.object({
  transactionId: z.string().uuid('ID da transação inválido'),
  payment: transactionPaymentSchema,
});

export type AddPaymentRequest = z.infer<typeof AddPaymentRequestSchema>;

// Transaction Status Update DTO
export const UpdateTransactionStatusRequestSchema = z.object({
  status: z.nativeEnum(TransactionStatus),
  notes: z.string().max(500).optional(),
});

export type UpdateTransactionStatusRequest = z.infer<typeof UpdateTransactionStatusRequestSchema>;

