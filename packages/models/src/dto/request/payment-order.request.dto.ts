/**
 * Payment Order Request DTOs with Zod validation
 */

import { z } from 'zod';
import { PaymentOrderStatus, PaymentOrderType, PaymentMethod } from '../../interfaces/payment-order.interface';

// Base schemas
const paymentOrderItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  reference: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

const paymentOrderApprovalSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  action: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(500).optional(),
});

const paymentOrderExecutionSchema = z.object({
  executedBy: z.string().uuid('ID do executor inválido'),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().max(200).optional(),
  bankDetails: z.object({
    bank: z.string().min(1, 'Banco é obrigatório').max(100),
    agency: z.string().min(1, 'Agência é obrigatória').max(20),
    account: z.string().min(1, 'Conta é obrigatória').max(20),
    accountType: z.enum(['CHECKING', 'SAVINGS']),
  }).optional(),
  pixDetails: z.object({
    key: z.string().min(1, 'Chave PIX é obrigatória').max(100),
    type: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']),
  }).optional(),
  notes: z.string().max(500).optional(),
});

// Create Payment Order DTO
export const CreatePaymentOrderRequestSchema = z.object({
  type: z.nativeEnum(PaymentOrderType),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  
  // Related entities
  supplierId: z.string().uuid('ID do fornecedor inválido').optional(),
  customerId: z.string().uuid('ID do cliente inválido').optional(),
  
  // Items and amounts
  items: z.array(paymentOrderItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  
  // Approval workflow
  requiresApproval: z.boolean().default(true),
  approvalLimit: z.number().min(0).optional(),
  
  // Dates
  dueDate: z.string().datetime().optional(),
  
  // Additional information
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export type CreatePaymentOrderRequest = z.infer<typeof CreatePaymentOrderRequestSchema>;

// Update Payment Order DTO
export const UpdatePaymentOrderRequestSchema = z.object({
  status: z.nativeEnum(PaymentOrderStatus).optional(),
  title: z.string().min(1, 'Título é obrigatório').max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  
  // Related entities
  supplierId: z.string().uuid('ID do fornecedor inválido').optional(),
  customerId: z.string().uuid('ID do cliente inválido').optional(),
  
  // Items and amounts
  items: z.array(paymentOrderItemSchema).optional(),
  
  // Approval workflow
  requiresApproval: z.boolean().optional(),
  approvalLimit: z.number().min(0).optional(),
  
  // Dates
  dueDate: z.string().datetime().optional(),
  
  // Additional information
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export type UpdatePaymentOrderRequest = z.infer<typeof UpdatePaymentOrderRequestSchema>;

// Approve/Reject Payment Order DTO
export const ApprovePaymentOrderRequestSchema = z.object({
  paymentOrderId: z.string().uuid('ID da ordem de pagamento inválido'),
  action: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(500).optional(),
});

export type ApprovePaymentOrderRequest = z.infer<typeof ApprovePaymentOrderRequestSchema>;

// Execute Payment Order DTO
export const ExecutePaymentOrderRequestSchema = z.object({
  paymentOrderId: z.string().uuid('ID da ordem de pagamento inválido'),
  execution: paymentOrderExecutionSchema,
});

export type ExecutePaymentOrderRequest = z.infer<typeof ExecutePaymentOrderRequestSchema>;

// Payment Order Search DTO
export const PaymentOrderSearchRequestSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(PaymentOrderType).optional(),
  status: z.nativeEnum(PaymentOrderStatus).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  supplierId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  isOverdue: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['requestedAt', 'dueDate', 'amount', 'priority', 'status']).default('requestedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaymentOrderSearchRequest = z.infer<typeof PaymentOrderSearchRequestSchema>;






