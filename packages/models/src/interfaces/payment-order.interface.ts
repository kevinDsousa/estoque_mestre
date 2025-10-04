/**
 * Payment Order related interfaces
 */

export enum PaymentOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentOrderType {
  SUPPLIER_PAYMENT = 'SUPPLIER_PAYMENT',
  CUSTOMER_REFUND = 'CUSTOMER_REFUND',
  EXPENSE_PAYMENT = 'EXPENSE_PAYMENT',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  CREDIT = 'CREDIT'
}

export interface IPaymentOrderItem {
  id: string;
  description: string;
  amount: number;
  reference?: string; // transaction ID, invoice number, etc.
  category?: string;
  notes?: string;
}

export interface IPaymentOrderApproval {
  id: string;
  userId: string;
  userName: string;
  action: 'APPROVED' | 'REJECTED';
  comments?: string;
  approvedAt: Date;
}

export interface IPaymentOrderExecution {
  id: string;
  executedBy: string;
  executedAt: Date;
  method: PaymentMethod;
  reference?: string;
  bankDetails?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'CHECKING' | 'SAVINGS';
  };
  pixDetails?: {
    key: string;
    type: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  };
  notes?: string;
}

export interface PaymentOrderSummary {
  totalAmount: number;
  itemsCount: number;
  approvedAmount: number;
  pendingAmount: number;
  executedAmount: number;
}

