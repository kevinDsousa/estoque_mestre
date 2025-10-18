/**
 * Payment Order Response DTOs
 */

import { z } from 'zod';
import { PaymentOrderStatus, PaymentOrderType, PaymentMethod } from '../../interfaces/payment-order.interface';

// Base schemas
const paymentOrderItemResponseSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  amount: z.number(),
  reference: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

const paymentOrderApprovalResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  action: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
  approvedAt: z.date(),
});

const paymentOrderExecutionResponseSchema = z.object({
  id: z.string().uuid(),
  executedBy: z.string().uuid(),
  executedAt: z.date(),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
  bankDetails: z.object({
    bank: z.string(),
    agency: z.string(),
    account: z.string(),
    accountType: z.enum(['CHECKING', 'SAVINGS']),
  }).optional(),
  pixDetails: z.object({
    key: z.string(),
    type: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']),
  }).optional(),
  notes: z.string().optional(),
});

const paymentOrderSummaryResponseSchema = z.object({
  totalAmount: z.number(),
  itemsCount: z.number(),
  approvedAmount: z.number(),
  pendingAmount: z.number(),
  executedAmount: z.number(),
});

// Payment Order Response DTO
export const PaymentOrderResponseSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  type: z.nativeEnum(PaymentOrderType),
  status: z.nativeEnum(PaymentOrderStatus),
  companyId: z.string().uuid(),
  
  // Basic information
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  
  // Related entities
  supplierId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  
  // Items and amounts
  items: z.array(paymentOrderItemResponseSchema),
  summary: paymentOrderSummaryResponseSchema,
  
  // Approval workflow
  approvals: z.array(paymentOrderApprovalResponseSchema),
  requiresApproval: z.boolean(),
  approvalLimit: z.number().optional(),
  
  // Execution
  execution: paymentOrderExecutionResponseSchema.optional(),
  
  // Dates
  requestedAt: z.date(),
  approvedAt: z.date().optional(),
  executedAt: z.date().optional(),
  dueDate: z.date().optional(),
  
  // Additional information
  notes: z.string().optional(),
  tags: z.array(z.string()),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PaymentOrderResponse = z.infer<typeof PaymentOrderResponseSchema>;

// Payment Order List Response DTO
export const PaymentOrderListResponseSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  type: z.nativeEnum(PaymentOrderType),
  status: z.nativeEnum(PaymentOrderStatus),
  companyId: z.string().uuid(),
  
  // Basic information
  title: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  
  // Related entities
  supplierId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  
  // Summary
  summary: paymentOrderSummaryResponseSchema,
  
  // Dates
  requestedAt: z.date(),
  dueDate: z.date().optional(),
  
  // Timestamps
  createdAt: z.date(),
});

export type PaymentOrderListResponse = z.infer<typeof PaymentOrderListResponseSchema>;

// Payment Order Summary Response DTO
export const PaymentOrderSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  type: z.nativeEnum(PaymentOrderType),
  status: z.nativeEnum(PaymentOrderStatus),
  title: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  totalAmount: z.number(),
  requestedAt: z.date(),
  dueDate: z.date().optional(),
  isOverdue: z.boolean(),
  daysOverdue: z.number(),
});

export type PaymentOrderSummaryResponse = z.infer<typeof PaymentOrderSummaryResponseSchema>;

// Payment Order Approval Response DTO
export const PaymentOrderApprovalResponseSchema = z.object({
  approvals: z.array(paymentOrderApprovalResponseSchema),
  isFullyApproved: z.boolean(),
  canBeExecuted: z.boolean(),
});

export type PaymentOrderApprovalResponse = z.infer<typeof PaymentOrderApprovalResponseSchema>;

// Payment Order Execution Response DTO
export const PaymentOrderExecutionResponseSchema = z.object({
  execution: paymentOrderExecutionResponseSchema,
  remainingAmount: z.number(),
  isCompleted: z.boolean(),
});

export type PaymentOrderExecutionResponse = z.infer<typeof PaymentOrderExecutionResponseSchema>;







