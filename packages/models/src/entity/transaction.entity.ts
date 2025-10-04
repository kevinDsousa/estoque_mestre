/**
 * Transaction entity
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  TransactionType, 
  TransactionStatus, 
  PaymentStatus,
  ITransactionItem,
  ITransactionPayment,
  TransactionSummary
} from '../interfaces/transaction.interface';

export class Transaction implements IBaseEntityWithCompany {
  id!: string;
  type!: TransactionType;
  status!: TransactionStatus;
  paymentStatus!: PaymentStatus;
  companyId!: string;
  
  // Related entities
  customerId?: string;
  supplierId?: string;
  userId!: string; // who created/processed the transaction
  
  // Transaction details
  items!: ITransactionItem[];
  payments!: ITransactionPayment[];
  summary!: TransactionSummary;
  
  // Additional information
  reference?: string; // external reference number
  notes?: string;
  discount?: number;
  tax?: number;
  shippingCost?: number;
  
  // Dates
  transactionDate!: Date;
  dueDate?: Date;
  paidAt?: Date;
  
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  customer?: any; // Will be typed when Customer entity is imported
  supplier?: any; // Will be typed when Supplier entity is imported
  user?: any; // Will be typed when User entity is imported

  constructor(data: Partial<Transaction>) {
    Object.assign(this, data);
  }

  // Helper methods
  isSale(): boolean {
    return this.type === TransactionType.SALE;
  }

  isPurchase(): boolean {
    return this.type === TransactionType.PURCHASE;
  }

  isReturn(): boolean {
    return this.type === TransactionType.RETURN;
  }

  isConfirmed(): boolean {
    return this.status === TransactionStatus.CONFIRMED;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isCancelled(): boolean {
    return this.status === TransactionStatus.CANCELLED;
  }

  isPaid(): boolean {
    return this.paymentStatus === PaymentStatus.PAID;
  }

  isPartiallyPaid(): boolean {
    return this.paymentStatus === PaymentStatus.PARTIAL;
  }


  getTotalPaid(): number {
    return this.payments.reduce((total, payment) => total + payment.amount, 0);
  }

  getRemainingAmount(): number {
    return this.summary.total - this.getTotalPaid();
  }

  getItemsCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalDiscount(): number {
    return this.items.reduce((total, item) => total + (item.discount || 0), 0) + (this.discount || 0);
  }

  isOverdue(): boolean {
    if (!this.dueDate || this.isPaid()) return false;
    return new Date() > this.dueDate;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.dueDate!.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
