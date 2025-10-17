/**
 * Transaction related interfaces
 */

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  DAMAGE = 'DAMAGE',
  EXPIRATION = 'EXPIRATION'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface ITransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  notes?: string;
}

export interface ITransactionPayment {
  method: 'CASH' | 'CREDIT' | 'PIX' | 'CARD' | 'TRANSFER';
  amount: number;
  reference?: string;
  processedAt?: Date;
}

export interface TransactionSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemsCount: number;
}






